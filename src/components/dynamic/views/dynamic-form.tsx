"use client";

import { useState } from "react";
import { View, Model, ModelField } from "@/lib/schema/app-config";

interface DynamicFormProps {
  appSlug: string;
  view: View;
  model: Model;
}

export function DynamicForm({ appSlug, view, model }: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Determine which fields to display in the form.
  const fieldsToDisplay = view.formFields && view.formFields.length > 0 
    ? model.fields.filter(f => view.formFields!.includes(f.name))
    : model.fields;

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Send the payload to the dynamically generated backend engine
      const res = await fetch(`/api/runtime/${appSlug}/${model.name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit form");
      }

      setSuccess(true);
      setFormData({}); // Reset form upon success
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function renderField(field: ModelField) {
    const value = formData[field.name] || "";
    
    switch (field.type) {
      case "boolean":
        return (
          <input
            type="checkbox"
            checked={!!formData[field.name]}
            onChange={(e) => handleChange(field.name, e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        );
      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(field.name, isNaN(e.target.valueAsNumber) ? undefined : e.target.valueAsNumber)}
            required={field.required}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
          />
        );
      case "date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
          />
        );
      default:
        return (
          <input
            type={field.type === "email" ? "email" : "text"}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
          />
        );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white">
      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
          Record successfully created!
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      {fieldsToDisplay.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
            {field.name.replace(/([A-Z])/g, ' $1').trim()} {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.description && (
            <p className="text-xs text-gray-500 mb-2">{field.description}</p>
          )}
          {field.type === "boolean" ? (
            <div className="flex items-center mt-2">
              {renderField(field)}
              <span className="ml-2 text-sm text-gray-600 font-medium">Enable</span>
            </div>
          ) : (
            renderField(field)
          )}
        </div>
      ))}

      <div className="pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : "Save Record"}
        </button>
      </div>
    </form>
  );
}
