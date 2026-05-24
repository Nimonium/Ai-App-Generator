"use client";

import { useState, useEffect } from "react";
import { View, Model } from "@/lib/schema/app-config";

interface DynamicTableProps {
  appSlug: string;
  view: View;
  model: Model;
}

export function DynamicTable({ appSlug, view, model }: DynamicTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Determine which columns to display. Default to all fields if none specified.
  const columnsToDisplay = view.columns && view.columns.length > 0 
    ? view.columns 
    : model.fields.map(f => f.name);

  useEffect(() => {
    async function fetchData() {
      try {
        // Uses the dynamic API routes built in Phase 2
        const res = await fetch(`/api/runtime/${appSlug}/${model.name}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch data");
        }
        const json = await res.json();
        setData(json.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [appSlug, model.name]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto ring-1 ring-gray-200 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columnsToDisplay.map((col) => (
              <th
                key={col}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columnsToDisplay.length}
                className="px-6 py-8 text-center text-sm text-gray-500"
              >
                No records found.
              </td>
            </tr>
          ) : (
            data.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                {columnsToDisplay.map((col) => {
                  const val = record.data[col];
                  // Safely render objects/arrays if they sneaked in, or standard primitives
                  const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val ?? "");
                  return (
                    <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {displayVal}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
