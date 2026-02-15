# City Dude

A 2D top-down adventure game where you play as **The Dude**, exploring the city of **Dude Angeles**.

## How to Play

### Quick Start

You need a local web server to run the game (ES modules require it). Choose one:

```bash
# Option 1: Python (built-in)
python3 -m http.server 8082

# Option 2: Node.js
npx serve -l 8082 .

# Option 3: PHP
php -S localhost:8082
```

Then open `http://localhost:8082` in your browser.

### Controls

| Key | Action |
|-----|--------|
| Arrow Keys / WASD | Move The Dude |
| Enter / Space | Start game |

### Gameplay

- Explore the city of **Dude Angeles**
- Follow the goal marker to reach your destination
- Check the minimap (bottom-right) for orientation
- Walk near buildings to see their names

## Project Structure

```
city_dude/
├── index.html              # Main HTML page
├── README.md               # This file
└── js/
    ├── main.js             # Entry point
    ├── constants.js        # Game-wide constants & colors
    ├── Game.js             # Main game loop & state management
    ├── Input.js            # Keyboard input handler
    ├── Camera.js           # Smooth-follow camera
    ├── Player.js           # Player character & sprites
    ├── TileMap.js          # World rendering & collision
    ├── GoalManager.js      # Extensible quest/goal system
    ├── HUD.js              # UI overlay (goals, messages, minimap)
    └── maps/
        └── dudeAngeles.js  # Map data for Dude Angeles
```

## Adding New Content

### Adding a New Goal

1. Open `js/maps/dudeAngeles.js`
2. Add a new goal object to the `goals` array:

```javascript
{
    id: 'my_new_goal',
    title: 'Visit the Library',
    description: 'Head to the Public Library downtown.',
    type: 'reach_spot',
    targetCol: 18,
    targetRow: 31,
    radius: 2,
    completeMessage: 'You found the library!',
    nextGoalId: null, // or chain to another goal ID
}
```

3. Chain goals by setting `nextGoalId` on the previous goal

### Adding a New Goal Type

1. Open `js/GoalManager.js`
2. Add a new case in `_checkGoalCondition()`:

```javascript
case 'collect_item': {
    return player.inventory.has(goal.itemId);
}
```

### Adding a New Map/Area

1. Create a new file in `js/maps/` (e.g., `beachtown.js`)
2. Export a builder function that returns the same structure as `dudeAngeles.js`
3. Load it in `Game.js` to switch areas

## Tech Stack

- Pure HTML5 Canvas + vanilla JavaScript (ES modules)
- No external dependencies or build tools
- Pre-rendered tile map for smooth performance
- Programmatic character sprites (no image assets needed)

## Future Ideas

- [ ] NPCs to talk to
- [ ] Inventory system
- [ ] Indoor areas (buildings you can enter)
- [ ] Day/night cycle
- [ ] Sound effects and music
- [ ] More cities/areas
- [ ] Save/load system
- [ ] Items and collectibles
