const fs = require('fs');
const path = require('path');

function htmlToJsx(html) {
    let jsx = html;
    // Basic JSX conversions
    jsx = jsx.replace(/class=/g, 'className=');
    jsx = jsx.replace(/for=/g, 'htmlFor=');
    jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');
    jsx = jsx.replace(/viewbox=/g, 'viewBox=');
    jsx = jsx.replace(/stroke-width=/g, 'strokeWidth=');
    jsx = jsx.replace(/stroke-dasharray=/g, 'strokeDasharray=');
    jsx = jsx.replace(/stroke-dashoffset=/g, 'strokeDashoffset=');
    // Self close common tags if they aren't
    jsx = jsx.replace(/<img([^>]*[^\/])>/g, '<img$1 />');
    jsx = jsx.replace(/<input([^>]*[^\/])>/g, '<input$1 />');
    jsx = jsx.replace(/<br([^>]*[^\/])>/g, '<br$1 />');
    jsx = jsx.replace(/<hr([^>]*[^\/])>/g, '<hr$1 />');
    return jsx;
}

const outDir = path.join(__dirname, 'src/app/dashboard');

const pages = [
    { inFile: 'dashboard.html', outPath: path.join(outDir, 'analytics', 'page.tsx'), componentName: 'AnalyticsReportingPage' },
    { inFile: 'content-studio.html', outPath: path.join(outDir, 'content', 'page.tsx'), componentName: 'AIContentStudioPage' },
    { inFile: 'audience-insights.html', outPath: path.join(outDir, 'audience', 'page.tsx'), componentName: 'AudienceInsightsPage' },
    { inFile: 'settings.html', outPath: path.join(outDir, 'settings', 'page.tsx'), componentName: 'SettingsBrandKitPage' }
];

pages.forEach(page => {
    const filePath = path.join(__dirname, 'stitching_assets/persona_engine', page.inFile);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return;
    }

    const html = fs.readFileSync(filePath, 'utf-8');

    // Extract everything inside <main ...> ... </main>
    const match = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (match) {
        let content = htmlToJsx(match[1]);

        // Remove the extra header/footer space strings if present, we'll keep it simple for now
        // Some might have <!-- Footer for space -->, we can keep it.

        // Ensure directory exists
        const pageDir = path.dirname(page.outPath);
        if (!fs.existsSync(pageDir)) {
            fs.mkdirSync(pageDir, { recursive: true });
        }

        const componentCode = `export default function ${page.componentName}() {
    return (
        <>
            ${content}
        </>
    );
}`;
        fs.writeFileSync(page.outPath, componentCode, 'utf-8');
        console.log(`Created ${page.outPath}`);
    } else {
        console.warn(`Could not find <main> content in ${page.inFile}`);
    }
});
