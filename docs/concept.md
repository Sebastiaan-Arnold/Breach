# Breach: Top-Down SWAT Game Concept

Oct 26, 2026 · @Sebastiaan Arnold

## Pitch

Breach (working title) is a top-down tactical shooter where you lead a single SWAT operator into a building you've only seen on a rough briefing map. You plan from incomplete intel, go in seeing only what your operator sees, and clear every room without getting hit or harming civilians. Between missions, a story campaign takes you from rookie to lieutenant in the fictional harbour city of Port Ardley. Missions last 3 to 8 minutes, which suits a browser tab now and a phone later.

The closest references are Door Kickers (top-down, line of sight, room clearing) and Ready or Not (tension, uncertainty, procedure). Breach sits between them: simpler to control than Door Kickers, far more readable than Ready or Not.

**Design pillars**

- **Information is the real weapon.** The briefing gives you a picture that's mostly right, never fully right. Good players read it carefully and adapt when it's wrong.
- **You only know what you see.** Line of sight drives everything. Every closed door and blind corner is a decision.
- **Slow is smooth.** Rushing gets you killed; careful play is rewarded with a better score, not just survival.
- **One more mission.** Short levels, fast restarts and visible progress keep players coming back.

## Core loop

Each mission follows the same rhythm: read the intel, choose how to go in, clear the site, then see how you did. The loop is short enough to replay a level straight away for a better score.

&#91;embedded content: core loop · 4 steps\]

Clearing the site is where most of the time goes, but the briefing and prep steps decide how hard it will be. If the operator goes down, the player restarts from the briefing, where the intel stays the same but the actual situation is rolled again.

## Briefing phase

The briefing is a single screen styled like a police tablet: a floor plan on the left, an intel panel on the right and a Deploy button. Players can spend as long as they like here, and that's the point. Time spent reading the map pays off inside.

**What the map shows**

- **The layout**, drawn as a simple blueprint: walls, doors, windows and stairs. Some areas are greyed out as "unknown" (a back room nobody has plans for, a room added after the plans were filed).
- **Markings from command**, like a red X for last known suspect position, a circled room where civilians were reported and arrows for possible escape routes.
- **Entry points** you can choose from (front door, back door, a window, a loading bay on warehouse levels). Picking your entry is the main tactical choice before the mission.

**What the intel panel says**

- **Estimated hostiles** as a range, never a number: "3 to 5 suspects".
- **Expected loadout** in plain language: "handguns reported, possibly one shotgun".
- **Civilians** if any: "two staff members may still be inside".
- **A reliability rating** for the intel (Confirmed, Likely, Unverified). This tells players how much to trust the map.

**How the uncertainty works**

Each level has a fixed layout, but the game rolls the actual situation when you deploy. The real enemy count falls inside the stated range most of the time. On "Unverified" intel, there's a chance of one extra enemy, a different weapon or a marked room that turns out empty. That keeps replays fresh and stops players memorising a solution. It also makes the reliability rating meaningful without being unfair: the game never lies outright, it just isn't sure.

One optional extra worth considering: let players place up to three pins on the map ("check here first") that stay visible as faint markers in the mission. It rewards planning without giving away the layout.

## Vision and fog of war

The camera is top-down and centred on your operator, but the screen only reveals what the operator can actually see. A cone of vision (around 100 degrees, plus a short radius all round for peripheral awareness) is cast from the operator's position and blocked by walls and closed doors. Everything outside it is dark.

**Three layers of knowledge**

- **Visible:** fully lit, enemies and items shown in real time.
- **Remembered:** rooms you've already seen stay drawn as a dim outline. Furniture and walls remain, but enemies don't. If someone walked in after you left, you won't know.
- **Unknown:** pure black. Not even walls are shown.

This gives you exactly the effect you described. Memorising the briefing map isn't required, because the game draws what you've seen as you go. But players who remember the plan know where the next door leads before they open it, and that's a real edge.

**Sound as information**

Sound fills the gaps that vision leaves. Footsteps, a door creaking or a suspect shouting appear as a brief ripple on screen at roughly the right position, even through walls. It's vague on purpose: you know something is in the next room, not exactly where. Your own actions make noise too. Running is loud, walking is quiet and kicking a door alerts the whole floor.

**No map during the mission**

Once you deploy, the briefing is gone. What you remember and what you've already seen on screen is all you have, which is exactly what makes the briefing screen worth reading.

## Combat and controls

Combat is real time, fast and lethal on both sides: one or two hits down an enemy, and three hits take you out (body armour absorbs the first). That makes every corner tense and keeps missions short.

**Core actions**

- **Move** at walking pace by default, with a sprint that's faster but loud.
- **Aim:** your operator always aims down the sights, and a laser runs from the weapon to the first wall or person it hits. Players see exactly where a shot will land. Moving makes the laser wobble, standing still steadies it, so stopping before a doorway becomes a natural habit.
- **Shoot** wherever the laser points.
- **Doors** are the heart of the game. Each closed door offers a small menu: open slowly, kick open (fast, loud, stuns anyone right behind it) or peek (crack it open to see a slice of the room).
- **Secure civilians:** hold a button next to a civilian to get them on the ground and out of the line of fire. It adds to your score.
- **Reload** manually, with a limited number of magazines.

**Controls on web**

WASD to move, mouse to aim, left click to shoot, right click on a door for the door menu, E to interact, R to reload and Shift to sprint. Standard and instantly familiar.

**Controls on iOS (later)**

Parked until after a successful web release. The laser actually helps here, because touch players can see exactly where they're pointing. A left stick for movement and a right stick that aims and fires on release is the likely setup.

## Enemies and civilians

The AI doesn't need to be clever, it needs to be readable. Players should be able to learn how each type behaves and predict it, with enough variation that no room plays out the same twice.

| Type | Weapon | Behaviour | First appears |
| --- | --- | --- | --- |
| Lookout | Handgun | Stationary, faces a door or window. Alerts nearby enemies if he sees you. | Officer campaign |
| Patroller | Handgun | Walks a fixed route between rooms. Makes footstep sounds you can track. | Officer campaign |
| Hider | Shotgun | Waits behind furniture or in a corner, only fires at close range. Punishes rushing. | Senior Officer campaign |
| Heavy | Rifle, armour | Takes extra hits, pushes towards noise. | Sergeant campaign |

**AI states**

Each enemy runs a simple state machine with three states: Idle (standing or patrolling), Alert (heard something, moves to investigate) and Combat (sees you, shoots or takes cover). Noise you make pushes nearby enemies from Idle to Alert, which is what makes careful play pay off. Three states is about as simple as enemy AI gets, which suits a first build.

**Civilians**

Civilians panic, run or freeze and sometimes block a doorway. Hitting one costs a large score penalty and the second star, but the mission carries on. Securing them adds to the score. On early levels keep them clearly visible in bright clothing so players aren't punished for things they couldn't read.

**Randomisation**

Each level defines a pool of possible enemy spawns per room. On deploy, the game picks the actual set based on the briefing range and reliability. Positions and types vary, the layout doesn't.

## Loadout and progression

You start with a small kit and unlock new guns as you get promoted. No gadgets for now, so each new weapon has to change how you play.

**Starter kit**

- **Pistol** with 3 spare magazines: accurate, low capacity. Always carried as a sidearm.
- **Light body armour:** absorbs one hit.
- **Flashlight:** extends your vision cone in dark rooms.

**Gun unlocks**

| Gun | Trade-off | Unlocked at |
| --- | --- | --- |
| Pistol | Accurate and quiet, but small magazine | Start |
| SMG | High fire rate and fast handling, weak at range | Senior Officer |
| Shotgun | Devastating up close, wide spread risks civilians | Sergeant |
| Assault rifle | Accurate at range, loud and slower to swing round corners | Lieutenant |

Before each mission you pick one primary gun and always carry the pistol. Handling matters as much as damage: heavier guns make the laser wobble more and turn more slowly, so the SMG is often the better pick for tight houses even once you have the rifle.

**Scoring and stars**

Each mission ends with a debrief and up to three stars: one for completing it, one for no civilian hit and one for finishing without taking damage. Promotion to the next rank needs a minimum number of stars from the current campaign, which gives players a reason to replay a mission more carefully. I'd avoid a time-based score, because it pushes players to rush.

## Training, levels and story

The game opens at the police academy range, then follows your operator through four campaigns, one per rank. Every level is a single ground floor for now; multiple floors can come later.

**Training: the Range**

A classic wooden shooting range with plywood walls and cardboard targets teaches every mechanic without walls of text. It runs as a short sequence of stations:

- **Movement lane:** walk, sprint and notice how sprinting is loud.
- **Target lane:** aim with the laser, feel it wobble while moving and steady when you stop.
- **Door station:** open, kick and peek through plywood doors, with pop-up targets behind them.
- **Shoot or don't:** cardboard targets showing either a suspect with a gun or a civilian, which teaches the penalty early.
- **Kill house:** a small wooden building with the lights off, combining everything. It's also a good place to try out a newly unlocked gun.

**Levels**

Levels are built on a tile grid (say 32 px tiles), which makes line of sight, enemy movement and the briefing map easy to generate from the same data. The briefing map is a simplified render of the level file with the unknown zones blanked out. Each mission introduces one new idea, so players learn without a tutorial.

**Story and campaigns**

The structure borrows from L.A. Noire, where Cole Phelps works his way up through police desks and each desk tells part of a bigger story. Here, each rank is a campaign of five missions. The cases look unrelated at first, but a thread runs through them: the small-time dealers you raid as a rookie turn out to work for a smuggling ring, which leads to the money men and finally the people running it.

| Rank | Campaign | Locations | Story thread |
| --- | --- | --- | --- |
| Recruit | Academy | The Range | Learn the job |
| Officer | Street crime | Houses | Raids on dealers that keep mentioning the same supplier |
| Senior Officer | Supply chain | Offices, warehouses | A logistics firm that's moving more than parcels |
| Sergeant | Clean money | Hotel floors | The ring's accountants meeting at a city hotel |
| Lieutenant | The top | Villas | The people behind it all, with friends in high places |

The story is told almost entirely through the briefing screen: case files, short radio messages, a photo of a suspect pinned to the map. A promotion screen with a short text from your captain closes each campaign. That's cheap to produce, needs no cutscenes and makes the briefing feel even more important.

For building the levels, Tiled (a free map editor) is enough to start. A custom editor can wait.

## Art, audio and tone

Keep the art minimal and flat. Think clean blueprint lines for walls, simple shapes for characters (a circle with a direction marker works fine to start), and strong colour coding: blue for you, red for hostiles, yellow for civilians. That reads well on a small phone screen, it's quick to produce and it fits the briefing-map style, so the mission feels like the plan coming to life.

Darkness carries the atmosphere. Unknown areas are near-black, remembered areas dim and your vision cone slightly warm. That contrast does most of the work.

For audio, sound is a gameplay system, not decoration: footsteps, door creaks, radio chatter at the start ("Team, you're cleared to enter") and a short sting when the site is secured. Free sound libraries like Freesound or Kenney's packs cover the basics.

On tone: keep it grounded and serious, with no gore. Downed enemies simply fall and fade. That keeps the age rating reasonable on the App Store and stays respectful given the subject. Avoid real place names and real organisations' logos.

## Tech plan

The smartest route is to build it once as a web game and wrap that same code for iOS later, rather than writing two games.

- **Engine:** Phaser 3 with TypeScript. It's a free, well-documented 2D game framework for the browser with built-in support for tile maps, input on keyboard and touch, and sound. Claude Code knows it well, which matters if you're building with it.
- **Line of sight:** a raycasting visibility polygon from the operator's position against wall edges. This is a well-known technique and there are small libraries for it, so you don't have to invent it.
- **Levels:** made in Tiled (a free map editor) and exported as JSON, which Phaser reads natively. That covers level building for now.
- **Hosting:** GitHub Pages. Push to the repo, a GitHub Action builds the game and publishes it. Free and automatic.
- **Saves:** progress (stars, unlocks) in the browser's local storage. Fine for a web game, and on iOS it carries over inside the app.
- **Path to iOS:** Capacitor wraps the web build into a native Xcode project. You'd need a Mac (which you have), Xcode and an Apple Developer account (99 USD a year). Apple accepts wrapped web games when they feel like a proper app, so offline play, touch controls and no browser-looking UI are a must.

Design for touch and a 16:9 phone screen from day one. Retrofitting touch controls onto a mouse-and-keyboard game is the most common reason these ports feel bad.

## Roadmap and MVP scope

The biggest risk with a game like this is building too much before finding out whether the core is fun. So the first milestone is one room, not one campaign.

1. **Prototype: the Range.** Movement, vision cone, laser aim, doors and cardboard targets. The training level doubles as the test bed, so nothing gets thrown away. The question to answer: does walking through a door into darkness feel tense?
2. **Vertical slice: first Officer mission.** Briefing screen, one house, two enemy types, civilians, the debrief with stars. Publish it on GitHub Pages and get five friends to play it.
3. **MVP: Academy plus the Officer campaign.** First case file story, sound ripples, local saves, promotion to Senior Officer with the SMG.
4. **Full web release: all four campaigns.** All guns, polish, audio, a proper title screen.
5. **iOS, after a successful web release.** Touch controls, Capacitor wrap, offline support and App Store review.

Cut on purpose for now: shouting and arrests, hostages, gadgets, multiple floors, squad members and multiplayer. All good ideas for later updates.

## Decisions

**Settled**

- **Solo operator**, no squad.
- **Real time**, no tactical pause.
- **Civilian hit = penalty**, not mission failure.
- **No briefing map** during the mission.
- **Five missions per campaign**, so 20 missions plus the Range for the full web release.
- **Enemies can't see your laser.**
- **Port Ardley**, a fictional harbour city, with Breach as the working title.
- **Web first**, iOS only after a successful web release.
