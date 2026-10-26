# Breach

A top-down tactical SWAT game set in the fictional harbour city of Port Ardley. You lead a single
operator into buildings you've only seen on a rough briefing map, see only what your operator
sees, and clear every room without getting hit or harming civilians.

The full design lives in [docs/concept.md](docs/concept.md).

## Status: milestone 2, vertical slice

The build has two levels: the police academy Range (training) and the first Officer case,
14 Harbour Lane, played from briefing to debrief.

- **Briefing:** a police tablet with the floor plan (unknown areas greyed out), command's marks,
  the case file and intel given as ranges with a reliability rating. Pick one of three entries,
  then deploy. The real situation is rolled from the intel on every deploy.
- **Intro:** each level opens with a short, skippable cutscene of the operator approaching the
  entry while radio lines play.
- **Enemies:** Lookouts and Patrollers with an Idle / Alert / Combat state machine. They see in a
  cone with real line of sight, hear your noise, investigate it, path through the house (opening
  doors) and shoot back. Lookouts shout to alert the others.
- **Civilians:** freeze or flee when shooting starts; hold E next to one to secure them.
- **Damage:** body armour absorbs the first hit; two more take the operator down, and you retry
  from the briefing with the situation rolled again.
- **Vision and fog of war:** a 60° raycast vision cone plus a short peripheral radius, blocked by
  walls and door leaves. Three layers: visible, remembered (dim, no live entities) and unknown (black).
- **Laser aim:** the laser shows exactly where a shot lands. It wobbles while you move or turn
  and steadies when you stand still. Heavier guns wobble more and turn more slowly.
- **Doors:** E or right-click opens or closes a door. The leaf is part of line of sight, so the
  room opens up as the door swings. (Kick and peek from the concept are parked for later.)
- **Sound as information:** your own noise shows as a ring of how far it carries. World sounds
  show as vague ripples through walls.
- **The Range:** five stations: movement lane, target lane, door station, shoot or don't, and a dark kill
  house whose targets re-roll on every run. Ends with the debrief and stars.
- **Minimal HUD and settings:** ammo, short messages and, on the Range only, tutorial text.
  Esc pauses and opens settings (blood effects, sound) and the controls.

### Controls

| Action | Key |
| --- | --- |
| Move | WASD (or arrows) |
| Sprint (loud) | Shift |
| Aim / fire | Mouse / left click |
| Open or close a door | E (nearest) or right click on it |
| Secure a civilian | Hold E next to them |
| Reload | R |
| Switch gun (Range only, for testing handling) | 1–4 |
| Skip the intro | Space |
| Pause, settings and controls | Esc |
| Frame-rate readout | F3 |

## Development

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests for geometry, visibility, pathfinding, levels and intel rolls
npm run build      # type-check and build to dist/
```

### Layout

```
src/
  core/      engine-independent logic: geometry, raycast visibility, level grid, collision,
             pathfinding
  levels/    level data: maps, entries, intel and spawn slots (ASCII maps for now; Tiled later)
  game/      game objects and systems: world, player, enemies, civilians, doors, fog, noise,
             effects, intro, weapons, audio, settings
  scenes/    Phaser scenes: menu, briefing, game and its HUD
tests/       vitest unit tests
```

Levels are ASCII grids of 32 px tiles (legend in `src/core/grid.ts`). The same data drives
collision, line of sight, enemy pathfinding and the briefing map.

## Versioning

Versions follow `0.<milestone>.<patch>` until the full web release (`1.0.0`):

| Version | Milestone |
| --- | --- |
| 0.1.x | Prototype: the Range |
| 0.2.x | Vertical slice: first Officer mission |
| 0.3.x | MVP: Academy plus the Officer campaign |
| 1.0.0 | Full web release |

Every commit is titled `vX.Y.Z: short summary`, bumps `version` in `package.json` in the same
commit, gets a matching git tag and an entry in [CHANGELOG.md](CHANGELOG.md). The version is
shown on the title card.

## Deployment

`.github/workflows/deploy.yml` tests, builds and publishes to GitHub Pages on every push to
`main`. One-time setup on GitHub: **Settings → Pages → Source: GitHub Actions**.

## Next

Finish milestone 2 with playtests of Harbour Lane and tuning from the feedback, then milestone 3:
the rest of the Officer campaign, its case-file story, local saves for stars and promotion to
Senior Officer with the SMG.
