export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { prompt, image } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required"
      });
    }

    if (!image) {
      return res.status(400).json({
        error: "Image is required"
      });
    }

    const match = image.match(/^data:(.+);base64,(.+)$/);

    if (!match) {
      return res.status(400).json({
        error: "Invalid image format"
      });
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const buffer = Buffer.from(base64Data, "base64");

    const blob = new Blob([buffer], {
      type: mimeType
    });

    const form = new FormData();

    form.append("model", "gpt-image-2");
    form.append("prompt", prompt);
    form.append("image[]", blob, "reference-image.png");
    form.append("size", "1024x1024");

    const response = await fetch(
      "https://api.openai.com/v1/images/edits",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: form
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Server error",
      message: error.message
    });
  }
}
