<div align="center">
	<br />
	<p>
		<img src="https://github.com/user-attachments/assets/24023511-022d-4fd3-a0a3-187d1d714dfa" width="546" alt="logo" />
	</p>
	<br />
</div>

# Rocket Telemetry Extractor

🚀 **Currently supports Starship and New Glenn. Falcon 9 and other rockets coming soon!**

This project leverages the Azure Vision API to extract telemetry data shown on the screen from frames, achieving a high accuracy of up to ~99.6%. However, due to the frame-by-frame analysis, the processing time can be significant (~2.5 hours for analyzing a 1-hour video).

## Requirements

Before running the script, you need an Azure Vision API key. (You can get one [here](https://portal.vision.cognitive.azure.com/demo/extract-text-from-images)). After getting your key, follow these steps:

1. **Create an .env file** in the root directory of the project.
2. Add the following lines to the .env file, replacing `<your-vision-key>` with your actual Azure Vision API key:

```bash
   VISION_ENDPOINT="https://ai-ocr-testing.cognitiveservices.azure.com/"
   VISION_KEY="<your-vision-key>"
```

# Installation
Make sure you have Node.js installed, then follow these steps:

1. ### Install dependencies:

```bash
npm install
```

2. ### Run the script:
There are 3 ways you can run the script:
- If you have the video link (This only works for Starship launches):

```bash
node src/index.js -v "<your-video-link-here>"
```

- If you want to specify the rocket name:

```bash
node src/index.js -v "<your-video-link-here>" -r "<name-of-the-rocket>"
```

- If you have already downloaded and trimmed the video to only the launch footage, place it in the `video-dataset` folder and run:

```bash
node src/index.js -r "<name-of-the-rocket>"
```

Supported rockets: `Starship`, `new_glenn`. Use these exact names in the `<name-of-the-rocket>` section.

## Post-Processing and Analysis

Since AI OCR may not always be 100% accurate, post-processing tools have been added to refine results:

- **Fixing extracted values:**
  If the OCR results contain errors, you can run the following command multiple times until you're satisfied with the extracted values (or until they no longer update):
  
  ```bash
  npm run fix
  ```
  
- **Generating analysis graphs:**
  Once you have corrected the extracted values, you can generate graphs for analysis:
  
  ```bash
  npm run analyze
  ```
  
- **Recommended Workflow:**
  For better accuracy, run `npm run fix` multiple times if needed, followed by `npm run analyze` to visualize the cleaned data.

## Notes
You can also start your Microsoft Azure AI journey with [this](https://learn.microsoft.com/en-us/plans/8pkkiy5x76oy7y?tab=tab-created&source=docs&learnerGroupId=440f340c-27d3-4554-9fb2-88fe82a9a692&wt.mc_id=studentamb_447844) link. (Yes, this is my referral link, and it would be appreciated if you signed up through it!)

> The script processes every frame of the video, which can take a considerable amount of time.

> Ensure your Azure Vision API key has the necessary permissions and quotas for the volume of requests you’re making.

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

💡 **Contributions welcome!** Feel free to submit issues or pull requests. 🚀

