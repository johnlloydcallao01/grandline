import { config } from 'dotenv';
config();
async function run() {
  const url = 'http://localhost:3001/api/chats?limit=100&depth=0';
  const apiKey = process.env.PAYLOAD_API_KEY;
  const opts = { headers: { Authorization: 'users API-Key ' + apiKey } };
  const res = await fetch(url, opts).then(r => r.json());
  if (!res.docs) return console.log('Failed:', res);

  for (const chat of res.docs) {
    if (chat.lastMessagePreview === '[Message]') {
      const msgRes = await fetch('http://localhost:3001/api/chat-messages?limit=1&sort=-createdAt&where[chat][equals]=' + chat.id, opts).then(r => r.json());
      if (msgRes.docs && msgRes.docs.length > 0) {
        const doc = msgRes.docs[0];
        let extractedText = '';
        const extractTextNode = (node) => {
          if (!node) return '';
          if (typeof node === 'string') return node;
          if (typeof node.text === 'string') return node.text;
          if (Array.isArray(node.children)) {
            return node.children.map(extractTextNode).filter(Boolean).join(' ');
          }
          if (node.root) return extractTextNode(node.root);
          return '';
        };
        if (doc.content) {
          extractedText = extractTextNode(doc.content).trim().replace(/\s+/g, ' ');
        }
        let contentPreview = extractedText;
        if (contentPreview.length > 80) contentPreview = contentPreview.substring(0,80).trim() + '...';
        else if (!contentPreview) contentPreview = doc.contentType === 'image' ? '[Image]' : '[File]';
        
        await fetch('http://localhost:3001/api/chats/' + chat.id, {
          ...opts,
          method: 'PATCH',
          headers: { ...opts.headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ lastMessagePreview: contentPreview })
        });
        console.log('Fixed chat', chat.id, '->', contentPreview);
      }
    }
  }
  console.log('Done');
}
run();
