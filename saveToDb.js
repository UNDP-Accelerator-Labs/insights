require('dotenv').config();
const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
// const pool =  require('./db');
const { evaluateArticleType, extractLanguageFromUrl, article_types } = require('./utils');
const { saveQuery, saveHrefLinks } = require('./query');
const getPdfMetadataFromUrl = require('./pdf');
const getWordDocumentMetadataFromUrl = require('./docx');

// const { 
  const production = true;
// } = process.env;

// Set up the Chrome options
const options = new chrome.Options();
// // if(production == 'true' ){
  options.addArguments('--headless'); // Run Chrome in headless mode (without a UI)
  options.addArguments('--window-size=1920,1080'); // Set the window size
  options.addArguments('--no-sandbox')
  options.addArguments('--disable-dev-shm-usage')
// }
// else{
//   options.addArguments('--start-maximized'); // Maximize the window
//   options.addArguments('--disable-gpu'); // Disable the GPU
//   options.addArguments('--disable-dev-shm-usage'); // Disable shared memory usage
//   options.addArguments('--no-sandbox'); // Disable the sandbox
// }

// Set up the WebDriver
const driver = new Builder()
  .forBrowser('chrome')
  .setChromeOptions(options)
  .build();

// sample word doc 
// let docurl = 'https://popp.undp.org/_layouts/15/WopiFrame.aspx?sourcedoc=/UNDP_POPP_DOCUMENT_LIBRARY/Public/HR_Non-Staff_International%20Personnel%20Services%20Agreement_IPSA.docx&action=default'
const extractAndSaveData = async (url ) => {
  // Navigate to the URL
  await driver.get(url);

  let articleTitle = '';
  let postedDate = '';
  let country = '';
  let contentElements = [];
  let content = '';

  let languageName = await extractLanguageFromUrl(url) ||  'en';
  let postedDateStr = ''
  let archorTags = [];
  let hrefObj = []
  

  let article_type = await evaluateArticleType(url);
  let html_content = await driver.findElement(By.tagName('body')).getText() || null;

  if(article_type == 'document'){
    if(url.includes('.pdf')){
      // Extract pdf content and metadata
      const pdfContent = await getPdfMetadataFromUrl(url);
      content = pdfContent?.text || '';
      postedDate = pdfContent?.metadata?._metadata['xmp:createdate'] || null;
      postedDateStr = pdfContent?.metadata?._metadata['xmp:createdate'] || '';
      articleTitle = pdfContent?.metadata?._metadata['dc:title'] || pdfContent?.text?.substring(0, 100) || '';

    }
    else if(url.includes('.docx') 
    || url.includes('.doc')
    || url.includes('.odt') 
    || url.includes('.rtf') 
    || url.includes('.txt')
    || url.includes('docs.goo') 
    ){
      console.log('word doc')
      // Extract docx content and metadata
      // const docxContent = await getWordDocumentMetadataFromUrl(url);
      // content = docxContent?.text || '';
      // postedDate = docxContent?.metadata?.creationDate || new Date();
      // postedDateStr = docxContent?.metadata?.creationDate || '';
      // articleTitle = docxContent?.metadata?.title ||  '';

      return;
    }

  }
  else if ( article_type == 'project'){

    try {
      articleTitle = await driver.findElement(By.css('.coh-inline-element.title-heading')).getText() | null;
    } catch(err){ 
      articleTitle = ''
    }
    
    try{
      postedDateStr = await driver.findElement(By.css('.coh-inline-element.column.publication-card__title h6')).getText() | null;
    }
    catch(err){
      postedDateStr = ''
    }

    postedDate = isNaN(new Date(postedDateStr)) ? null : new Date(postedDateStr);

    // Extract the content
    try{
      contentElements = await driver.findElements(By.css('.grid-container p'));
      archorTags = await driver.findElements(By.css('.grid-container a'));
    }
    catch (err){
        console.log('error', err)
    }

    content = '';
    for (let i = 0; i < contentElements.length; i++) {
      const text = await contentElements[i].getText();
      content += text + '\n';
    }

    //extract href link and text in a blog if it exist
    for (let i = 0; i < archorTags?.length; i++) {
      const linktext = await archorTags[i].getText();
      const href = await archorTags[i].getAttribute('href');
      hrefObj.push({
        linktext,
        href
      })
    }

  }
  else if (article_type == 'publications'){
    
    articleTitle = await driver.findElement(By.css('.coh-inline-element.column')).getText() | null;
    postedDateStr = await driver.findElement(By.css('.coh-inline-element.column.publication-card__title h6')).getText() | null;
    postedDate = isNaN(new Date(postedDateStr)) ? null :  new Date(postedDateStr);
    //Extract country
    country = await driver.findElement(By.css('.site-title a')).getText() | null;

    // Extract the content
    try{
      contentElements = await driver.findElements(By.css('.coh-container.coh-wysiwyg p'));
    }
    catch (err){
        console.log('error', err)
    }

    content = '';
    for (let i = 0; i < contentElements.length; i++) {
      const text = await contentElements[i].getText();
      content += text + '\n';
    }
    
  }
  else if (url.includes('.medium.com')){
    postedDateStr = await driver.findElement(By.css('.pw-published-date')).getText() | null;
    postedDate = isNaN(new Date(postedDateStr)) ? null :  new Date(postedDateStr);
    languageName = '';

    // // Extract the article title
    articleTitle = await driver.findElement(By.className('pw-post-title')).getText() | null;

    // //Extract country
    country = await driver.findElement(By.css('.bk a')).getText() | null;

    // // Extract the content
    try{
      contentElements = await driver.findElements(By.css('.gq.gr.gs.gt.gu p'));
      archorTags = await driver.findElements(By.css('.gq.gr.gs.gt.gu a'));
    }
    catch (err){
        console.log('error', err)
    }

    content = '';
    for (let i = 0; i < contentElements.length; i++) {
      const text = await contentElements[i].getText();
      content += text + '\n';
    }

    //extract href link and text in a blog if it exist
    for (let i = 0; i < archorTags?.length; i++) {
      const linktext = await archorTags[i].getText();
      const href = await archorTags[i].getAttribute('href');
      hrefObj.push({
        linktext,
        href
      })
    }

  }
  else if (article_types.filter(p => url.includes(p)).length > 0) {
    // Extract the article title
    articleTitle = await driver.findElement(By.className('article-title')).getText() || null;

    // Extract the posted date
    postedDateStr = await driver.findElement(By.className('posted-date')).getText() | null;;
    postedDate = isNaN(new Date(postedDateStr)) ? null : new Date(postedDateStr) ;

    //Extract country
    country = await driver.findElement(By.css('.site-title a')).getText() | null;

    // Extract the content
    try{
      contentElements = await driver.findElements(By.css('.coh-inline-element.m-content.coh-wysiwyg p'));
      archorTags = await driver.findElements(By.css('.coh-inline-element.m-content.coh-wysiwyg a'));
    }
    catch (err){
        console.log('error', err)
    }

    //extract content of a blog
    content = '';
    for (let i = 0; i < contentElements.length; i++) {
      const text = await contentElements[i].getText();
      content += text + '\n';
    }

    //extract href link and text in a blog if it exist
    for (let i = 0; i < archorTags?.length; i++) {
      const linktext = await archorTags[i].getText();
      const href = await archorTags[i].getAttribute('href');
      hrefObj.push({
        linktext,
        href
      })
    }
  }
  else {
     // Extract the article title
     articleTitle = null;

     // Extract the posted date
     postedDateStr = null;
     postedDate = null;
 
     //Extract country
     country = await driver.findElement(By.css('.site-title a')).getText() || null;
 
     // Extract the content
     try{
      archorTags = await driver.findElements(By.css('a'));
     }
     catch (err){
         console.log('error', err)
     }
 
     content = '';

     //extract href link and text in a blog if it exist
     for (let i = 0; i < archorTags?.length; i++) {
       const linktext = await archorTags[i].getText();
       const href = await archorTags[i].getAttribute('href');
       hrefObj.push({
         linktext,
         href
       })
     }
  }

  // Save the data to the database
  // try{
    
  //   await pool.query(
  //       saveQuery(url, country, languageName, articleTitle, postedDate, content, article_type, postedDateStr, html_content) 
  //       )
  //       .then(async (data)=>{
  //         console.log('saving article content to db')

  //         //save href links in a blog if it exist
  //         if(hrefObj.length > 0){
  //           await hrefObj.forEach(obj=> obj.article_id = data.rows[0].id );
            
  //           await pool.query(
  //             saveHrefLinks(hrefObj)
  //           )
  //           .then((res) => {
  //             console.log('successfully saved href links in blogs');
  //             hrefObj = [];
  //           })
  //           .catch(err => {
  //             console.error('Error saving href to table:', err);
  //             hrefObj = [];
  //           });
  //         }
          
  //       })
  //       .catch(err => {
  //         console.error('Error saving blog content to table:', err);
  //       });
  // }
  // catch(err){
  //   console.log("Error occurred while saving data to database", err, url)
  // };

  return;
}


// extractAndSaveData()

module.exports = extractAndSaveData;