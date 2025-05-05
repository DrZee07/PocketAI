// Image processing utilities for the application
import sharp from "sharp"

export async function resizeIcon(inputPath: string, outputPath: string, size: number): Promise<void> {
  try {
    await sharp(inputPath)
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toFile(outputPath)

    console.log(`Successfully resized icon to ${size}x${size}`)
  } catch (error) {
    console.error("Error resizing icon:", error)
    throw error
  }
}

// This would be called in a build script or server-side code
// For client-side preview, we'll use pre-generated icons
