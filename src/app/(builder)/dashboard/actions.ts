"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createApp(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  let name = formData.get("name") as string;
  const prompt = formData.get("prompt") as string;
  
  if (!name && prompt) {
    // derive a quick name from prompt
    name = prompt.split(" ").slice(0, 3).join(" ");
    name = name.charAt(0).toUpperCase() + name.slice(1) + " App";
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);

  const initialConfig = {
    name,
    description: prompt || "A new dynamic application",
    models: [],
    views: [],
    navigation: []
  };

  const app = await prisma.app.create({
    data: { name, slug, ownerId: session.user.id, config: initialConfig }
  });

  revalidatePath("/dashboard");
  // Redirect to the builder models page for the new app
  redirect(`/app/${app.id}/models`);
}
