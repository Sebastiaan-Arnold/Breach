# Breach

A top-down tactical SWAT game set in the fictional harbour city of Port Ardley. You lead a single
operator into buildings you've only seen on a rough briefing map, see only what your operator
sees, and clear every room without getting hit or harming civilians.

The full design lives in [docs/concept.md](docs/concept.md).

## Status: milestone 1, the Range

The current build is the prototype from the roadmap: the police academy Range, which doubles as
the test bed for the core feel. Its question: does walking through a door into darkness feel tense?

- **Vision and fog of war:** a 100° raycast vision cone plus a short peripheral radius, blocked by
  walls and door leaves. Three layers: visible, remembered (dim, no live entities) and unknown (black).
- **Laser aim:** the laser shows exactly where a shot lands. It wobbles while you move or turn
  and steadies when you stand still. Heavier guns wobble more and turn more slowly.
- **Doors:** right-click for open slowly, kick (loud, stuns anyone right behind it) or peek (a
  cracked door reveals a thin slice of the room). E opens or closes the nearest door.
- **Sound as information:** your own noise shows as a ring of how far it carries. World sounds
  show as vague ripples through walls.
- **Five stations:** movement lane, target lane, door station, shoot or don't, and a dark kill
  house whose targets re-roll on every run. Ends with the debrief and stars.

### Controls

| Action | Key |
| --- | --- |
| Move | WASD (or arrows) |
| Sprint (loud) | Shift |
| Aim / fire | Mouse / left click |
| Door menu | Right click on a door |
| Open or close nearest door | E |
| Reload | R |
| Flashlight | F |
| Switch gun (Range only, for testing handling) | 1–4 |

## Development

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests for geometry, visibility, level parsing, collision
npm run build      # type-check and build to dist/
```

### Layout

```
src/
  core/      engine-independent logic: geometry, raycast visibility, level grid, collision
  levels/    level data (ASCII tile maps for now; Tiled JSON later)
  game/      game objects and systems: player, doors, targets, fog, noise, weapons, audio
  scenes/    Phaser scenes: the Range and its HUD
tests/       vitest unit tests for src/core
```

Levels are ASCII grids of 32 px tiles (legend in `src/core/grid.ts`). The same data drives
collision, line of sight and, later, the briefing map.

## Deployment

`.github/workflows/deploy.yml` tests, builds and publishes to GitHub Pages on every push to
`main`. One-time setup on GitHub: **Settings → Pages → Source: GitHub Actions**.

## Next: milestone 2, vertical slice

Briefing screen, the first Officer mission (one house), Lookout and Patroller enemies with the
Idle / Alert / Combat state machine listening to the noise system, civilians that move, player
damage and armour.
