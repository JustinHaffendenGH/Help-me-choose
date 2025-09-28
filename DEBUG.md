# Chrome DevTools Integration

This project now supports Chrome DevTools debugging for both client-side and server-side code.

## Quick Start

### Option 1: Manual Setup
1. **Start the server in debug mode:**
   ```bash
   npm run start:debug
   ```

2. **Open Chrome DevTools:**
   - Open Chrome and go to `chrome://inspect`
   - Click "Configure" and add `localhost:9229`
   - Click "inspect" under Remote Target to debug server-side code

3. **Debug client-side code:**
   - Press `F12` in your browser while on `http://localhost:3000`

### Option 2: Automated Setup
```bash
npm run debug:full
```
This will start the server and launch Chrome with DevTools automatically.

## Available Debug Scripts

- `npm run start:debug` - Start server with debugging enabled
- `npm run start:debug-brk` - Start server with debugging and break on first line
- `npm run start:debug-daemon` - Start debug server in background
- `npm run debug:chrome` - Launch Chrome with proper debugging setup
- `npm run debug:full` - Start server and Chrome together

## Debug Information

Visit `http://localhost:3000/debug` to get current debug status and inspector URLs.

## Features

- **Server-side debugging**: Full Node.js debugging with breakpoints
- **Client-side debugging**: Standard Chrome DevTools for frontend code
- **Network inspection**: Monitor API calls to TMDB, Google Books, etc.
- **Performance profiling**: Analyze application performance
- **Console access**: Direct console access to both client and server

## Debugging Tips

1. **Set breakpoints in server code** by adding `debugger;` statements
2. **Use the Network tab** to inspect API calls and responses
3. **Monitor console logs** for both client and server output
4. **Profile performance** using the Performance tab
5. **Inspect elements** and modify CSS in real-time

## Troubleshooting

- If debugging doesn't connect, ensure port 9229 is not blocked
- Check `proxy.log` for server errors when running in daemon mode
- Restart the debug server if connection is lost