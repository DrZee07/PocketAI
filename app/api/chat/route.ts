import { StreamingTextResponse } from "ai"

// This is a mock implementation for the demo
// In a real app, we would use the AI SDK to interact with the model
export async function POST(req: Request) {
  const { messages, model } = await req.json()

  // Get the last message from the user
  const lastMessage = messages[messages.length - 1]

  // Create a text encoder
  const encoder = new TextEncoder()

  // Create a transform stream
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  // Simulate AI response with a delay
  const respond = async () => {
    let response = ""

    // Generate different responses based on the model and user message
    if (lastMessage.content.toLowerCase().includes("hello") || lastMessage.content.toLowerCase().includes("hi")) {
      response = `Hello! I'm running on the ${model} model. How can I help you today?`
    } else if (lastMessage.content.toLowerCase().includes("weather")) {
      response = `I don't have access to real-time weather data since I'm running locally on your device with the ${model} model. To get weather information, you would need to connect to an online service.`
    } else if (lastMessage.content.toLowerCase().includes("model")) {
      response = `I'm currently using the ${model} model, which is a small language model optimized to run efficiently on mobile devices. It has a smaller parameter count than large cloud-based models, but can still be helpful for many tasks while preserving your privacy.`
    } else {
      response = `I'm processing your message using the ${model} model running locally on your device. This ensures your data stays private. What else would you like to know?`
    }

    // Stream the response character by character with a delay
    for (const char of response) {
      await new Promise((resolve) => setTimeout(resolve, 20))
      await writer.write(encoder.encode(char))
    }

    await writer.close()
  }

  // Start responding
  respond()

  // Return a streaming response
  return new StreamingTextResponse(stream.readable)
}
