import { GoogleGenAI, Type, Modality } from "@google/genai";
import { BrainstormRequest, BrainstormResponse, StorySegment, StoryOption } from "../types";

const getClient = () => {
  // Use import.meta.env which is defined in vite.config.ts
  // @ts-ignore
  const apiKey = import.meta.env.API_KEY || import.meta.env.VITE_API_KEY;

  if (!apiKey) {
    throw new Error("API Key not found. Please set API_KEY in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

// --- BRAINSTORMING ---
export const generateBrainstormIdeas = async (
  request: BrainstormRequest
): Promise<BrainstormResponse> => {
  const ai = getClient();

  const exampleString = request.examples
    .filter((ex) => ex.trim() !== "")
    .map((ex) => `- ${ex}`)
    .join("\n");

  const userPrompt = `
    I am a writer looking for creative ideas.
    Task: Generate a list of specific ideas for: ${request.prompt}.
    Category: ${request.category}.
    Context about the story or situation: ${request.context}.
    ${exampleString ? `Here are some examples of the tone/style I want:\n${exampleString}` : ""}
    
    Please provide 5 to 10 distinct, creative, and high-quality options.
  `;

  // Define schema manually to avoid import issues
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      ideas: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A short catchy title for the idea" },
            description: { type: Type.STRING, description: "The detailed idea itself" },
          },
          required: ["title", "description"],
        },
      },
    },
    required: ["ideas"],
  };

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: "You are an expert creative writing assistant. Your ideas should be novel, specific, and highly evocative. Avoid generic tropes. Focus on sensory details and emotional depth.",
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.85,
      },
    });

    const text = result.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    return JSON.parse(text) as BrainstormResponse;
  } catch (error) {
    console.error("Error generating ideas:", error);
    throw error;
  }
};

// --- TEXT EDITOR ASSISTANCE ---
export const continueStory = async (currentText: string, projectTitle: string): Promise<string> => {
  const ai = getClient();
  // Take the last 4000 chars to keep context relevant but fits in context window easily
  const textContext = currentText.slice(-4000);

  const prompt = `
    You are a co-author helper for a story titled "${projectTitle}".
    
    Current Text (end of story so far):
    "${textContext}"
    
    Task: Write the next few paragraphs. Continue the style, tone, and plot naturally. 
    Do not repeat the last sentence of the current text. Just continue writing the story.
    Keep it under 200 words.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    return result.text || "";
  } catch (e) {
    console.error("Text generation failed", e);
    throw e;
  }
};

// --- AUDIO LECTURE SUMMARIZATION ---
export const summarizeLecture = async (
  audioBase64: string,
  mimeType: string,
  styleSample: string
): Promise<string> => {
  const ai = getClient();

  const prompt = `
    You are an intelligent study assistant helping a student.
    Task: Listen to the provided audio recording of a lecture or class discussion.
    Output: A comprehensive, well-structured summary of the key concepts, definitions, and arguments.
    
    Tone/Style Instruction:
    Write this summary as if it was written by the author of the text below (the student). Match their vocabulary complexity, sentence structure, and tone.
    
    Student's Writing Style Sample:
    "${styleSample.slice(-2000)}"
    
    If the sample is too short or empty, use a clear, concise, and intelligent student voice (Academic but accessible).
    Structure the output with clear headings if appropriate.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64
            }
          },
          { text: prompt }
        ]
      }
    });

    return result.text || "Could not generate summary from audio.";
  } catch (error) {
    console.error("Lecture summarization failed", error);
    throw error;
  }
};

// --- IMAGE GENERATION ---
export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};

export const generateCheatsheet = async (summary: string): Promise<string> => {
  const ai = getClient();

  try {
    // Step 1: Optimize prompt for visual representation
    const promptOptimization = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert design consultant. 
          Convert the following lecture summary into a detailed prompt for an AI Image Generator to create a "Visual Cheatsheet/Infographic".
          
          Lecture Summary: "${summary.slice(0, 2000)}"
          
          Rules for the Image Prompt:
          1. Subject: An educational infographic poster titled based on the summary.
          2. Content: Visual cues, icons, and structured layouts representing the key topics.
          3. Style: Flat vector art, clean lines, minimalist, academic aesthetic, organized layout. Cream or white background with distinct colored sections.
          4. Output: JUST the prompt string for the image generator. Do not include markdown.`
    });

    const imagePrompt = promptOptimization.text || "An educational infographic about the lecture.";
    console.log("Generated Cheatsheet Prompt:", imagePrompt);

    // Step 2: Generate Image
    return generateImage(imagePrompt);
  } catch (e) {
    console.error("Cheatsheet generation failed", e);
    throw e;
  }
};

// --- VEO VIDEO GENERATION ---

export const optimizePromptForVideo = async (text: string): Promise<string> => {
  const ai = getClient();
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Convert this story excerpt into a highly detailed, cinematic video generation prompt for an AI model (Veo). 
          Focus on visual details, camera movement, lighting, texture, and mood. 
          Make it concise (under 50 words) but visually evocative.
          
          Excerpt: "${text}"`,
    });
    return result.text || text;
  } catch (e) {
    console.error("Prompt optimization failed", e);
    return text;
  }
};

export const generateVideo = async (
  prompt: string,
  aspectRatio: '16:9' | '9:16',
  resolution: '720p' | '1080p' = '720p'
): Promise<string> => {
  const ai = getClient();

  try {
    console.log("Starting Veo generation with prompt:", prompt);

    // Use Veo 3.1 Fast Preview
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: resolution,
        aspectRatio: aspectRatio
      }
    });

    // Poll for completion
    let retryCount = 0;
    const maxRetries = 60; // 5 minutes max wait

    while (!operation.done && retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5s interval
      operation = await ai.operations.getVideosOperation({ operation: operation });
      retryCount++;
      console.log(`Polling Veo operation... attempt ${retryCount}`);
    }

    if (!operation.done) {
      throw new Error("Video generation timed out.");
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed: No URI returned. Check your API key permissions.");

    // Fetch the actual video bytes using the API key
    // @ts-ignore
    const apiKey = process.env.API_KEY;
    const response = await fetch(`${videoUri}&key=${apiKey}`);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to download generated video: ${response.status} ${errText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Veo generation error:", error);
    throw error;
  }
};

// --- AI CREATE (INTERACTIVE STORY ENGINE) ---

export const generateStorySegment = async (
  history: string,
  choice: string | null,
  genre: string
): Promise<StorySegment> => {
  const ai = getClient();

  const prompt = `
      You are an award-winning novelist collaborating with a user to write a serious, high-quality book.
      Genre: ${genre}

      STORY HISTORY:
      "${history.slice(-6000)}"

      USER CHOICE/DIRECTION:
      ${choice ? `The user chose to: ${choice}` : "Start the story. Write the opening scene."}

      Task:
      1. Write the next segment of the story (approx 150-250 words). It must be literary, evocative, and professional. Do not use cheap cliffhangers or YA tropes unless the genre specifically requests it.
      2. Generate a "Visual Prompt" for this specific scene that could be used to generate a cinematic video or image. You MUST explicitly specify the lighting (e.g., "golden hour", "harsh neon"), time of day, and weather conditions to ensure atmospheric consistency.
      3. Provide 3 distinct "Options" for where the story goes next. These MUST offer meaningful narrative branching:
         - Option 1 (Character Focus): Focus on internal development, emotional reaction, or a character moment.
         - Option 2 (Action/Plot): Introduce external conflict, a new event, or drive the plot forward aggressively.
         - Option 3 (Twist/Tone Shift): Shift the tone, introduce a mystery, or offer a surprising perspective shift.

      Return JSON format.
    `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      content: { type: Type.STRING, description: "The story prose." },
      visualPrompt: { type: Type.STRING, description: "Cinematic description of this scene." },
      choices: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, description: "Short label for the button (e.g. 'Introspect')" },
            text: { type: Type.STRING, description: "Description of the narrative direction" },
            type: { type: Type.STRING, enum: ['plot', 'character', 'tone', 'twist'] }
          },
          required: ["label", "text", "type"]
        }
      }
    },
    required: ["content", "visualPrompt", "choices"]
  };

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.8
    }
  });

  const data = JSON.parse(result.text || "{}");

  return {
    id: Date.now().toString(),
    content: data.content,
    visualPrompt: data.visualPrompt,
    choices: data.choices
  };
};

// --- TTS (TEXT TO SPEECH) ---
export const generateSpeech = async (text: string): Promise<string> => {
  const ai = getClient();
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        parts: [{ text: text }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      }
    });

    const base64Audio = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");

    // Return raw base64 PCM data (Int16 Little Endian, 24kHz)
    return base64Audio;
  } catch (e) {
    console.error("TTS generation failed", e);
    throw e;
  }
};

// --- CHARACTER & WORLD GENERATION ---

export const generateCharacter = async (genre: string): Promise<{ name: string; trait: string }> => {
  const ai = getClient();
  const prompt = `
        Generate a compelling protagonist for a story in the "${genre}" genre.
        Return JSON with:
        - name: Full name
        - trait: A core personality trait or defining characteristic (max 5 words)
    `;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          trait: { type: Type.STRING }
        },
        required: ["name", "trait"]
      }
    }
  });

  return JSON.parse(result.text || '{"name": "Unknown", "trait": "Mysterious"}');
};

export const detectStoryCharacters = async (text: string): Promise<{ characters: { name: string; gender: string }[] }> => {
  const ai = getClient();
  const prompt = `
        Analyze the following story text and identify the main characters present or mentioned.
        Infer their gender based on context (pronouns, names).
        
        Text: "${text.slice(-3000)}"
        
        Return JSON.
    `;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          characters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                gender: { type: Type.STRING, enum: ["male", "female", "neutral"] }
              },
              required: ["name", "gender"]
            }
          }
        },
        required: ["characters"]
      }
    }
  });

  return JSON.parse(result.text || '{"characters": []}');
};

// --- MULTI-SPEAKER AUDIO ---

export const generateMultiSpeakerAudio = async (text: string, config: any): Promise<string> => {
  // For now, we'll use the single speaker TTS as a fallback since multi-speaker requires more complex setup
  // In a real implementation, this would split text by speaker and generate separate audio clips
  // or use a model that supports multi-speaker generation directly.

  console.log("Generating audio with config:", config);
  return generateSpeech(text);
};