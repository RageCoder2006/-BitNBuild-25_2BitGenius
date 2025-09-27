from fastapi import FastAPI, UploadFile, File
import model
import uvicorn

app = FastAPI()

@app.post("/process-image")
async def process_image(file: UploadFile = File(...)):
    image_bytes = await file.read()

    objects = model.detect_objects(image_bytes)
    mood_data = model.get_image_mood(image_bytes)

    captions = generate_captions(objects, mood_data['mood'])
    hashtags = generate_hashtags(objects)

    return {
        "detected_objects": objects,
        "mood": mood_data,
        "captions": captions,
        "hashtags": hashtags
    }

def generate_captions(objects, mood):
    if not objects:
        return ["Great shot!"]

    object_names = objects[:3]
    if mood in ['joy', 'serenity']:
        return [f"Love this {', '.join(object_names)} moment! ✨"]
    elif mood == 'sad':
        return [f"Thoughtful capture of {', '.join(object_names)}"]
    else:
        return [f"Spotted: {', '.join(object_names)}"]

def generate_hashtags(objects):
    hashtags = []
    for obj in objects[:5]:
        hashtags.append(f"#{obj.replace(' ', '').lower()}")
    hashtags.extend(["#photography", "#ai", "#content"])
    return hashtags

if __name__ == "__main__":
    uvicorn.run("app:app", host="localhost", port=8000, reload=True)
