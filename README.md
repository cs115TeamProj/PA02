# Computer Graphics - Programming Assignment 2
======
## Requirents

1. Add key controls Q and E to rotate the avatar camera view to the left and right, respectively
  Look at how we move the avatar camera forward and backward and up and down with arrow keys
2. Replace the box avatar with a Monkey avatar (but still use the Physijs.BoxMesh container for the Physics)
  See L11 about Loading objects
3. Create a NonPlayableCharacter which moves toward the avatar if the avatar gets too close (e.g. 20 meters away)
  You can use the lookAt method to have the NPC face the avatar,
4. When the NPC hits the Avatar, the avatar should lose a point of health and the NPC should be teleported to a random position on the board
  see how we teleported the avatar with the "h" key
5. When the Avatar reaches zero health, the game should go to a You Lose scene, which the player can restart with the "r" key
  look at how we handle the "win" situation
6. Add a start screen, where the user can initiate play by hitting the P key
Each member of the team should also add at least one additional feature to the game
