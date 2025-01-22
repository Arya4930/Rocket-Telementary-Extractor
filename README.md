<div align="center">
	<br />
	<p>
		<img src="https://github.com/user-attachments/assets/24023511-022d-4fd3-a0a3-187d1d714dfa" width="546" alt="logo" />
	</p>
	<br />
</div>

### Currently works only for Starship and New Glenn. Support for Falcon-9 and other rockets in progress

This project leverages the Azure Vision API to extract telemetry data shown on the screen from frames, achieving a high accuracy of upto ~99.6%. However, due to the frame-by-frame analysis, the processing time can be significant (~2.5 hours for analyzing a 1-hour Video).

## Requirements

Before running the script, you need an Azure Vision API key. ( you can get one [here](https://portal.vision.cognitive.azure.com/demo/extract-text-from-images) ) After getting your key follow these steps:

1. **Create an .env file** in the root directory of the project.
2. Add the following lines to the .env file, replacing <your-vision-key> with your actual Azure Vision API key:

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
There are 3 ways you can run the script. Either you can get the link of the video and run ( This only works for Starship launches )

```bash
node src/index.js -v "<your-video-link-here>"
```
or you can put the name of the rocket and run 
```bash
node src/index.js -v "<your-video-link-here>" -r "<name-of-the-rocket>"
```
or you can download the video yourself and shorten it down to be just the launch footage, place it in `video-dataset` folder and simply run the command
```bash
npm src/index.js -r "<name-of-the-rocket>"
```
Supported rockets -> `Starship` and `new_glenn`, write these exact names in the `<name-of-the-rocket>` section

## Notes
You can also start your Microsoft Azure AI journey with [this](https://learn.microsoft.com/en-us/plans/8pkkiy5x76oy7y?tab=tab-created&source=docs&learnerGroupId=440f340c-27d3-4554-9fb2-88fe82a9a692&wt.mc_id=studentamb_447844) Link. ( Yes it is my referral link, would be appreciated if you did it from there )

> The script processes every frame of the video, which can take a considerable amount of time.

> Make sure your Azure Vision API key has the necessary permissions and quotas for the volume of requests you’re making.



## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
