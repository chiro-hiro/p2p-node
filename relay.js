/* eslint-disable no-console */

import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { circuitRelayServer } from "@libp2p/circuit-relay-v2";
import { keys } from "@libp2p/crypto";
import { identify } from "@libp2p/identify";
import { kadDHT, removePrivateAddressesMapper } from "@libp2p/kad-dht";
import { webSockets } from "@libp2p/websockets";
import { createLibp2p } from "libp2p";
import { ping } from "@libp2p/ping";

const server = await createLibp2p({
  privateKey: keys.privateKeyFromRaw(
    new Uint8Array([
      106, 96, 133, 102, 75, 65, 126, 187, 160, 159, 33, 65, 196, 188, 33, 59,
      205, 201, 229, 200, 109, 124, 150, 170, 89, 115, 87, 189, 58, 233, 139,
      111, 59, 239, 66, 8, 50, 217, 183, 242, 51, 223, 207, 232, 39, 47, 67, 42,
      240, 7, 42, 72, 210, 102, 0, 129, 88, 183, 130, 38, 14, 34, 206, 155,
    ])
  ),
  addresses: {
    listen: ["/ip4/0.0.0.0/tcp/43210/ws"],
  },
  transports: [webSockets()],
  connectionGater: { denyDialMultiaddr: () => false },
  connectionEncrypters: [noise()],
  streamMuxers: [yamux()],
  services: {
    identify: identify(),
    pubsub: gossipsub({
      allowPublishToZeroTopicPeers: true,
    }),
    relay: circuitRelayServer({
      reservations: {
        maxReservations: Infinity,
      },
    }),
    dth: kadDHT({
      clientMode: false,
      protocol: "/ipfs/kad/1.0.0",
      peerInfoMapper: removePrivateAddressesMapper,
    }),
    ping: ping(),
  },
});

console.log(
  "Relay listening on multiaddr(s): ",
  server.getMultiaddrs().map((ma) => ma.toString())
);
