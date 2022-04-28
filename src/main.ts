import { Game } from "@gathertown/gather-game-client";
import ora from 'ora';
import config from './config';

/**
 * *Astronauts*
 * 
 * The members of Assembless.
 */
 const MEMBERS = [
  {
    name: "Mike",
    gatherId: "1kZCHNAWcsZXqG1pZ9OzgFwX7jz2",
  },
  {
    name: "Rafał",
    gatherId: "CwzQmehbWCfiHpeaHg0bhUY91Mz1",
  },
  {
    name: "Bartek",
    gatherId: "zAbFaneypZOpmxkeNoF6eCyG6is1",
  },
  {
    name: "Krzysztof",
    gatherId: "H4wSnVqIjUYk7EQoY0IDFMEjSXY2",
  },
];

async function main () {
  console.log("Starting...");
  const spinner = ora('Starting Gather API Client').start(); 
  
  const gatherClient = new Game(config.gather.SPACE_ID, () => Promise.resolve({ apiKey: config.gather.API_KEY }));
  await gatherClient.connect();

  await new Promise(resolve => setTimeout(resolve, 5000));

  spinner.stop();
  console.clear();
  console.log("The Gather API Client is running!");

  // Subscriptions
  // gatherClient.subscribeToEvent('playerInteracts', async () => {
  //   // console.log(e);

  //   // console.log(await gatherClient.getObject(e.playerInteracts.objId));
  // });

  // eslint-disable-next-line prefer-const
  let doorInterval = [-1, -1];
  // eslint-disable-next-line prefer-const
  let isDoorOpen = [false, false];

  gatherClient.subscribeToEvent("playerMoves", async (e, c) => {
    doors.forEach((object, i) => {
      const interval = doorInterval[i];
      const open = isDoorOpen[i];

      const objX = object.obj.x;
      const objY = object.obj.y;
  
      const playerX = e.playerMoves.x;
      const playerY = e.playerMoves.y;
  
      const isNearX = playerX === objX || playerX === objX + 1;
      const isNearY = playerY === objY + 2 || playerY === objY - 1;
      // Make sure the direction is up or down
      const correctDirection = e.playerMoves.direction === 1 || e.playerMoves.direction === 3;
  
      
      // player is 1 tile away from the door top or bottom.
      if (!open && ((isNearX && isNearY) && correctDirection)) {
        const isMember = MEMBERS.find(m => m.gatherId === c.playerId);
  
        if(!isMember) {
          gatherClient.chat(c.playerId, [], "rw-6", { contents: "You are not a member of Assembless!" });
  
          return;
        }
  
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        clearTimeout(interval);
  
        // Remove impassable tiles to open
        gatherClient.setImpassable("rw-6", objX, objY + 1, false);
        gatherClient.setImpassable("rw-6", objX + 1, objY + 1, false);
        gatherClient.setImpassable("rw-6", objX, objY, false);
        gatherClient.setImpassable("rw-6", objX + 1, objY, false);
  
        // Remove door
        gatherClient.setObject("rw-6", object.obj.id, {...object.obj, x: 100000, y: 100000})
  
        console.log("Door opened by", c.player?.name ?? "Anonymous");
        isDoorOpen[i] = true;
    
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        doorInterval[i] = setTimeout(() => {
          // Add impassable tiles to close
          gatherClient.setImpassable("rw-6", objX, objY + 1, true);
          gatherClient.setImpassable("rw-6", objX + 1, objY + 1, true);
          gatherClient.setImpassable("rw-6", objX, objY, true);
          gatherClient.setImpassable("rw-6", objX + 1, objY, true);
          
          // Reset door position
          gatherClient.setObject("rw-6", object.obj.id, object.obj)
          
          console.log("Door closed")
          isDoorOpen[i] = false;
        }, 2000)
      }
    });
  })

  // Logic
  const doors = await Promise.all([
    gatherClient.getObject("BookshelfTall2x2 - FIWxHNkWQ5IYFeCuCq4ij_3e6a9467-c363-425f-83c1-22d1a8a388f1"),
    gatherClient.getObject("Bar (4x4) - pOtnN-LoOSSIetWGQu9AB_db7498ac-a3ef-44f6-8151-fda36fb9265f")
  ]);
};

main();