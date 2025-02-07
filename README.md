<div align="center">
	<br />
	<p>
		<img src="https://github.com/user-attachments/assets/24023511-022d-4fd3-a0a3-187d1d714dfa" width="546" alt="logo" />
	</p>
	<br />
</div>

# Rocket Telemetry Extractor

🚀 **Currently supports Starship and New Glenn. Falcon 9 and other rockets coming soon!**

This project leverages the **Azure Vision API** to extract telemetry data from video frames, achieving up to **99.6% accuracy**. However, since it processes frame-by-frame, it takes approximately **2.5 hours to analyze a 1-hour video**.

## 📌 Features
- 🚀 Extracts telemetry data from launch videos.
- 📊 Supports multiple rockets (Starship, New Glenn; more in progress).
- 🔍 Uses Azure Vision API for **highly accurate** OCR extraction.
- 🛠️ Supports **both online video links & local video files**.

---

## 📋 Requirements
Before running the script, you need an **Azure Vision API key**. Get one [here](https://portal.vision.cognitive.azure.com/demo/extract-text-from-images).

### 1️⃣ Setup Environment Variables
1. **Create a `.env` file** in the project's root directory.
2. Add the following lines, replacing `<your-vision-key>` with your Azure Vision API key:

```bash
VISION_ENDPOINT="https://ai-ocr-testing.cognitiveservices.azure.com/"
VISION_KEY="<your-vision-key>"
```

---

## ⚙️ Installation
Ensure you have **Node.js** installed, then follow these steps:

### 1️⃣ Install Dependencies:
```bash
npm install
```

### 2️⃣ Run the Script:
You have **three** ways to run the script:

#### ✅ Using a video link (Works only for **Starship** launches):
```bash
node src/index.js -v "<your-video-link-here>"
```

#### ✅ Specifying the rocket name:
```bash
node src/index.js -v "<your-video-link-here>" -r "<name-of-the-rocket>"
```

#### ✅ Using a **local video file**:
1. **Download & trim the video** to only include the launch.
2. **Place it in the `<video-title>/video-dataset/` folder**.
3. Run:
```bash
node src/index.js -r "<name-of-the-rocket>"
```

### 🛰️ Supported Rockets:
- **Starship** (`Starship`)
- **New Glenn** (`new_glenn`)

> 🚀 *Write the rocket name exactly as shown above.*

---

## 📌 Notes
- This script **processes every frame**, so it can take a while.
- Ensure your **Azure Vision API key** has the required permissions & quota.
- Start your **Microsoft Azure AI journey** [here](https://learn.microsoft.com/en-us/plans/8pkkiy5x76oy7y?tab=tab-created&source=docs&learnerGroupId=440f340c-27d3-4554-9fb2-88fe82a9a692&wt.mc_id=studentamb_447844) *(referral link appreciated!)*

---

## 📜 License
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

💡 **Contributions welcome!** Feel free to submit issues or pull requests. 🚀

