// const { buildConfig } = require('payload');
async function test() {
  try {
    const configModule = await import('./src/payload.config.ts');
    const config = await configModule.default;
    const mediaColl = config.collections.find(c => c.slug === 'media');
    
    // In Payload v3, the resolved config is what matters. To get the resolved config including plugins, we need to await the config promise or resolve it.
    // If it's a promise, await it.
    console.log(
      'Media fields:', 
      mediaColl.fields.map(f => f.name).filter(Boolean)
    );
  } catch(e) {
    console.error(e)
  }
}
test();
