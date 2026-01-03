# LocShare

Fast, decentralized peer-to-peer file sharing application.

## What is this?

LocShare is a desktop app for direct peer-to-peer file transfers. No central server, no cloud storage. Currently works over local networks with plans to add WebRTC support for internet-based transfers.

**Built with:** Electron, React, Node.js, TCP, Bonjour/mDNS

## Install from package

Pre-built packages are found on the
[Releases](https://github.com/Elphyn/loc_share_v2/releases) page.

## Build from source 

```bash
git clone https://github.com/Elphyn/loc_share_v2.git
cd loc_share_v2
npm install
cd src/web && npm install && cd ../..

# Run
npm run dev

# Build for linux
npm run build:linux 
```

## Usage

1. Launch LocShare on devices on the same local network
2. App should discover devices automatically 
3. Drop files and click "Send" next to a device
4. Done

## Current Limitations

- Only local transfers (no internet transfers yet)
- Linux support only (no Windows or mobile support) 
- Can't remove files after adding or add entire directories
- Minimal UI (design still in progress)

## Roadmap

- [ ] Better file handling (remove added files, add directories)
- [ ] Transfer cancellation
- [ ] Windows support
- [ ] Network interruption recovery
- [ ] Internet-based transfers with WebRTC([node-datachannel](https://github.com/murat-dogan/node-datachannel)) 
- [ ] Mobile app (React Native or Flutter)


## About

Personal project inspired by AirDrop and [LocalSend](https://github.com/localsend/localsend).

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
