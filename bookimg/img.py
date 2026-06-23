import os
import json
import base64
import urllib.request
import urllib.error
import time

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    env_path = os.path.join(project_dir, '.env')
    db_path = os.path.join(project_dir, 'db.json')
    image_dir = os.path.join(project_dir, 'public', 'bookimg')

    print(f"Project directory: {project_dir}")
    print(f"Loading environment from: {env_path}")
    print(f"Database file path: {db_path}")
    print(f"Image directory (where files are saved): {image_dir}")

    # Ensure the image directory exists (should exist already, but good practice)
    os.makedirs(image_dir, exist_ok=True)

    # Load API Key from .env
    api_key = None
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip().startswith('VITE_OPENAI_API_KEY'):
                    parts = line.strip().split('=', 1)
                    if len(parts) == 2:
                        key_val = parts[1].strip()
                        # Remove quotes if any
                        if (key_val.startswith('"') and key_val.endswith('"')) or \
                           (key_val.startswith("'") and key_val.endswith("'")):
                            key_val = key_val[1:-1]
                        api_key = key_val
                        break

    # Load db.json
    if not os.path.exists(db_path):
        print(f"Error: db.json not found at {db_path}")
        return

    with open(db_path, 'r', encoding='utf-8') as f:
        try:
            db_data = json.load(f)
        except Exception as e:
            print(f"Error parsing db.json: {e}")
            return

    books = db_data.get('books', [])
    if not books:
        print("No books found in database.")
        return

    print(f"Found {len(books)} books in database.")

    openai_url = 'https://api.openai.com/v1/images/generations'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}' if api_key else ''
    }

    updated_count = 0
    migrated_count = 0
    skipped_count = 0

    for idx, book in enumerate(books):
        book_id = book.get('id')
        title = book.get('title', '').strip()
        content = book.get('content', '').strip()
        cover_image_url = book.get('coverImageUrl', '').strip()

        # Filename configuration
        filename = f"book_{book_id}.png"
        local_file_path = os.path.join(image_dir, filename)
        db_url_reference = f"/bookimg/{filename}"

        print(f"\n[{idx+1}/{len(books)}] Book ID: {book_id} | Title: '{title}'")

        # 1. Check if the image file already exists on disk and is correctly referenced in DB
        if cover_image_url == db_url_reference and os.path.exists(local_file_path):
            print(f"=> Cover image already exists as file: {filename}. Skipping.")
            skipped_count += 1
            continue

        # 2. Migrate existing Base64 images to physical files
        if cover_image_url.startswith('data:image'):
            print("=> Base64 image found in DB. Migrating to physical file...")
            try:
                # Format is: data:image/png;base64,iVBORw0KGgoAAAANS...
                # We need to split at the comma to extract the raw base64 string
                if ',' in cover_image_url:
                    b64_data = cover_image_url.split(',', 1)[1]
                else:
                    b64_data = cover_image_url

                # Decode the base64 string
                img_bytes = base64.b64decode(b64_data)
                
                # Save to file
                with open(local_file_path, 'wb') as img_file:
                    img_file.write(img_bytes)

                # Update the DB URL reference
                book['coverImageUrl'] = db_url_reference
                migrated_count += 1

                # Save progress immediately
                with open(db_path, 'w', encoding='utf-8') as db_file:
                    json.dump(db_data, db_file, ensure_ascii=False, indent=2)
                
                print(f"=> Successfully migrated Base64 to file: {filename} and updated db.json!")
                continue
            except Exception as e:
                print(f"=> Error migrating Base64 image: {e}")
                continue

        # 3. Generate missing images via OpenAI API
        print("=> Generating cover image...")
        if not api_key:
            print("=> Error: Cannot generate image because VITE_OPENAI_API_KEY is not set in .env.")
            continue

        # Construct prompt matching BookFormPage.jsx exactly
        prompt = f'책의 표지를 그릴 것이다. "{title}"라는 제목을 그림에 반드시 작성해라. 또한, 책의 내용: "{content}" 을(를) 읽고, 해당 책의 내용과 어울리는 표지를 그려라'

        # Payload matching JSX exactly
        payload = {
            'model': 'gpt-image-2',
            'prompt': prompt,
            'n': 1,
            'size': '1024x1536',
            'quality': 'low',
            'output_format': 'png'
        }

        req = urllib.request.Request(
            openai_url,
            data=json.dumps(payload).encode('utf-8'),
            headers=headers,
            method='POST'
        )

        try:
            with urllib.request.urlopen(req) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                
                image_data = res_data.get('data', [])
                if not image_data:
                    print("=> Error: No image data returned in API response.")
                    continue

                b64_json = image_data[0].get('b64_json')
                img_url = image_data[0].get('url')

                img_bytes = None
                if b64_json:
                    img_bytes = base64.b64decode(b64_json)
                    print("=> Image retrieved directly as Base64 string from response.")
                elif img_url:
                    print(f"=> Image URL returned: {img_url}")
                    print("=> Fetching and converting image from URL...")
                    img_req = urllib.request.Request(img_url)
                    with urllib.request.urlopen(img_req) as img_res:
                        img_bytes = img_res.read()

                if img_bytes:
                    # Save image bytes as file
                    with open(local_file_path, 'wb') as img_file:
                        img_file.write(img_bytes)

                    # Update the DB reference
                    book['coverImageUrl'] = db_url_reference
                    updated_count += 1
                    
                    # Save progress immediately
                    with open(db_path, 'w', encoding='utf-8') as db_file:
                        json.dump(db_data, db_file, ensure_ascii=False, indent=2)
                    print(f"=> Cover image successfully generated, saved to: {filename}, and updated in db.json!")
                else:
                    print("=> Error: Could not extract image from response (both b64_json and url are missing).")

        except urllib.error.HTTPError as e:
            try:
                error_body = e.read().decode('utf-8')
                print(f"=> OpenAI API HTTP Error: {e.code} - {error_body}")
            except Exception:
                print(f"=> OpenAI API HTTP Error: {e.code}")
        except Exception as e:
            print(f"=> Unexpected Error: {e}")

        # Sleep briefly to avoid triggering rate limit rules
        time.sleep(1)

    print(f"\nProcessing complete.")
    print(f"- Skipped (already existed as file): {skipped_count}")
    print(f"- Migrated from Base64 to file: {migrated_count}")
    print(f"- Newly generated from API: {updated_count}")

if __name__ == '__main__':
    main()
