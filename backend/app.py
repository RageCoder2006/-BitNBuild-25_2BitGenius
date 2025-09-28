from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import model
import uvicorn
import os
from dotenv import load_dotenv
import json

load_dotenv("../secrets.env")
GEMINI_API = os.getenv("GOOGLE_API_KEY")
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
genai.configure(api_key=GEMINI_API)  # Set environment variable
gemini_model = genai.GenerativeModel('gemini-2.5-flash')


@app.post("/process-image")
async def process_image(file: UploadFile = File(...)):
    image_bytes = await file.read()

    objects = model.detect_objects(image_bytes)
    mood_data = model.get_image_mood(image_bytes)

    captions = generate_captions(objects, mood_data['mood'])  # gemini api
    hashtags = generate_hashtags(objects)  # gemini api

    return {
        "detected_objects": objects, # list output
        "mood": mood_data, # dictionary output
        "captions": captions,  # string or list output
        "hashtags": hashtags  # string or list output
    }


def generate_captions(objects, mood):
    if not objects:
        return ["Great shot!"]

    try:
        prompt = f"""
        Generate 3 engaging social media captions for an image containing: {', '.join(objects)}
        The mood of the image is: {mood}

        Make them creative, engaging, and include relevant emojis.
        Return as a JSON array of strings only.
        Not more than 10 words
        """
        response = gemini_model.generate_content(prompt)
        print(f"DEBUG: Raw Gemini response: {response}")  # **DEBUG**
        print(f"DEBUG: Response text: {response.text}")
        captions = json.loads((response.text))
        return captions

    except Exception as e:
        object_names = objects[:3]
        if mood in ['joy', 'serenity']:
            return [f"Love this {', '.join(object_names)} moment! ✨"]
        elif mood == 'sad':
            return [f"Thoughtful capture of {', '.join(object_names)}"]
        else:
            return [f"Spotted: {', '.join(object_names)}"]


def generate_hashtags(objects):
    try:
        prompt = f"""
        Generate 8-10 trending hashtags for a social media post featuring: {', '.join(objects)}

        Include:
        - Object-specific hashtags
        - 2-3 trending general hashtags  
        - Photography-related hashtags

        Return as a JSON array of hashtag strings (include # symbol).
        """

        response = gemini_model.generate_content(prompt)
        hashtags = json.loads(response.text)
        return hashtags if isinstance(hashtags, list) else response.text.split()

    except Exception as e:
        hashtags = []
        for obj in objects[:5]:
            hashtags.append(f"#{obj.replace(' ', '').lower()}")
        hashtags.extend(["#photography", "#ai", "#content"])
        return hashtags

if __name__ == "__main__":
    uvicorn.run("app:app", host="localhost", port=8000, reload=True)
