// Import necessary functions and objects from other files

import { create_QR } from "./qr.function";
import { boleto_template } from "../template/boleto.template";
import puppeteer from "puppeteer";
import { uploadImage_Firebase } from "./save_image.function";

// Define an asynchronous function named convert_Image
export async function convert_Image(Data: any) {
      // Define launch options for Puppeteer
    let launchOptions = {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      };

      // Generate a base64 encoded QR image using the create_QR function
      let base64_QR_Image = await create_QR(Data);
  
      // Generate HTML content for the ticket using the boleto_template function
      const htmlContent = boleto_template(Data, base64_QR_Image);

      // Launch a Puppeteer browser instance
      const browser = await puppeteer.launch(launchOptions);
      // Create a new page in the browser
      const page = await browser.newPage();

      // Set the viewport size of the page
      await page.setViewport({ width: 595, height: 1110, deviceScaleFactor: 1});

      // Set the content of the page to the generated HTML content
      await page.setContent(htmlContent);
       // Take a screenshot of the page
      const screenshotBuffer = await page.screenshot({
        type: 'jpeg',// Set the image type to JPEG
        quality: 1000,// Set the quality of the image
      });

       // Convert the screenshot buffer to base64 encoding
      const screenshotBase64 = screenshotBuffer.toString('base64');
  
      // Close the Puppeteer browser instance
      await browser.close();

      // Set the file name for the screenshot
      let file_name = 'boleto.jpg';

      // Upload the screenshot image to Firebase storage and get the path URL
      let path_urlImage = await uploadImage_Firebase(screenshotBase64, file_name);

      // Return the path URL of the uploaded image
      return path_urlImage;
  
}