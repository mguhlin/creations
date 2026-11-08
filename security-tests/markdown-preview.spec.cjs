const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const courseModules={
  "tcea/courses/ai_essentials.html": [
    "welcome",
    "ai-essentials-for-educator-prompt-resource-library",
    "1-boodlebox-unlimited-apply-code-mgfree123",
    "2-chatgpt",
    "3-gemini-and-notebooklm",
    "4-perplexity",
    "5-running-ai-locally-and-safely-for-schools",
    "get-your-ai-essentials-for-educators-certificate"
  ],
  "tcea/courses/ai_essentials2.html": [
    "welcome",
    "library",
    "boodlebox",
    "chatgpt",
    "gemini",
    "perplexity",
    "local",
    "cert"
  ]
};
const pages={
 'markdown/index.html':[['md-input','md-preview']],
 'markdown/index_v2.html':[['md-input','md-preview']],
 'markdown/mg/index.html':[['md-input','md-preview']],
 'vibecoding/mguhlin_MD_Converter.html':[['wp-md-input','wp-md-preview'],['genai-md-input','genai-md-preview']],
 'tcea/courses/ai_essentials2.html':[['genai-md-input','genai-md-preview']],
 'tcea/courses/ai_essentials.html':[['genai-md-input','genai-md-preview']]
};
for(const [file,widgets] of Object.entries(pages))test('Markdown links remain safe and useful in '+file,async({page})=>{
 const source=fs.readFileSync(path.join(root,file),'utf8');const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>route.request().url()==='https://converter.test/'?route.fulfill({contentType:'text/html',body:source}):route.abort());await page.goto('https://converter.test/');
 if(file.startsWith('tcea/courses/')){
  expect(await page.locator('section.module').evaluateAll(nodes=>nodes.map(node=>node.id))).toEqual(courseModules[file]);
 }
 for(const [inputId,previewId] of widgets){
  const input=page.locator('#'+inputId),preview=page.locator('#'+previewId);
  const render=async value=>input.evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));},value);
  await page.evaluate(()=>delete window.__securevccFixture);
  await render('[Preview](https://example.org/" onpointerenter="window.__securevccFixture=1)');
  const link=preview.locator('a');await expect(link).toHaveCount(1);await expect(link).toHaveText('Preview');expect(await link.getAttribute('onpointerenter')).toBe(null);await link.dispatchEvent('pointerenter');expect(await page.evaluate(()=>window.__securevccFixture)).toBeUndefined();
  for(const [i,url] of ['javascript:window.__securevccFixture=1','JaVaScRiPt:window.__securevccFixture=1','java\tscript:window.__securevccFixture=1','data:text/html,fixture','vbscript:fixture'].entries()){const label='Bad'+i;await render('['+label+']('+url+')');await expect(preview).toContainText(label);await expect(preview.locator('a')).toHaveCount(0);}
  for(const url of ['https://example.org/guide?a=1&b=2','../guide.md#read','mailto:fixture@example.org']){await render('[Valid]('+url+')');await expect(preview.locator('a')).toHaveAttribute('href',url);await expect(preview.locator('a')).toHaveAttribute('rel','noopener noreferrer');}
  if(inputId==='md-input'){
   for(const [value,attribute,expected] of [['![Alt](https://example.org/" onerror="window.__securevccFixture=2)','src','https://example.org/" onerror="window.__securevccFixture=2'],['![Alt" onload="window.__securevccFixture=3](https://example.org/image.png)','alt','Alt" onload="window.__securevccFixture=3']]){
    await render(value);const image=preview.locator('img');await expect(image).toHaveCount(1);await expect(image).toHaveAttribute(attribute,expected);expect(await image.getAttribute('onerror')).toBe(null);expect(await image.getAttribute('onload')).toBe(null);await image.dispatchEvent('error');await image.dispatchEvent('load');expect(await page.evaluate(()=>window.__securevccFixture)).toBeUndefined();
   }
   await render('![Unsafe](javascript:window.__securevccFixture=4)');await expect(preview.locator('img')).toHaveCount(0);
   await render('![Image](https://example.org/image.png)');await expect(preview.locator('img')).toHaveAttribute('src','https://example.org/image.png');await expect(preview.locator('img')).toHaveAttribute('alt','Image');
  }
  await render('# Example\n\n**Bold** and `code` with "quotes" & symbols.');await expect(preview.locator('h1')).toHaveText('Example');await expect(preview.locator('strong')).toHaveText('Bold');await expect(preview.locator('code')).toHaveText('code');await expect(preview).toContainText('"quotes" & symbols.');
 }
 expect(errors).toEqual([]);
});
