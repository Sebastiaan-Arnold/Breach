# Breach: Game Design Concept

## Pitch

Breach (working title) is a top-down tactical shooter where you lead a single SWAT operator into a building you've only seen on a rough briefing map. You plan from incomplete intel, go in seeing only what your operator sees, and clear every room without getting hit or harming civilians. Between missions, a story campaign takes you from rookie to lieutenant in the fictional harbour city of Port Ardley. Missions last 3 to 8 minutes, which suits a browser tab now and a phone later.

The closest references are Door Kickers (top-down, line of sight, room clearing) and Ready or Not (tension, uncertainty, procedure). Breach sits between them: simpler to control than Door Kickers, far more readable than Ready or Not.

**Design pillars**

- **Information is the real weapon.** The briefing gives you a picture that's mostly right, never fully right. Good players read it carefully and adapt when it's wrong.
- **You only know what you see.** Line of sight drives everything. Every closed door and blind corner is a decision.
- **Slow is smooth.** Rushing gets you killed; careful play is rewarded with a better score, not just survival.
- **One more mission.** Short levels, fast restarts and visible progress keep players coming back.

## Core loop

Each mission follows the same rhythm, short enough to replay a level straight away for a better score:

1. **Brief:** read the intel and the floor plan.
2. **Prepare:** choose an entry point and a loadout.
3. **Clear:** go in and clear the site.
4. **Debrief:** see how you did and earn stars.

Clearing the site is where most of the time goes, but the briefing and preparation decide how hard it will be. If the operator goes down, the player restarts from the briefing, where the intel stays the same but the actual situation is rolled again.

## Briefing phase

The briefing is a single screen styled like a police tablet: a floor plan on the left, an intel panel on the right and a Deploy button. Players can spend as long as they like here, and that's the point. Time spent reading the map pays off inside.

**What the map shows**

- **The layout**, drawn as a simple blueprint: walls, doors, windows and stairs. Some areas are greyed out as "unknown" (a back room nobody has plans for, a room added after the plans were filed).
- **Markings from command**, like a red X for last known suspect position, a circled room where civilians were reported and arrows for possible escape routes.
- **Entry points** to choose from (front door, back door, a window, a loading bay on warehouse levels). Picking the entry is the main tactical choice before the mission.

**What the intel panel says**

- **Estimated hostiles** as a range, never a number: "3 to 5 suspects".
- **Expected loadout** in plain language: "handguns reported, possibly one shotgun".
- **Civilians** if any: "two staff members may still be inside".
- **A reliability rating** for the intel (Confirmed, Likely, Unverified). This tells players how much to trust the map.

**How the uncertainty works**

Each level has a fixed layout, but the game rolls the actual situation on deploy. The real enemy count falls inside the stated range most of the time. On "Unverified" intel, there's a chance of one extra enemy, a different weapon or a marked room that turns out empty. That keeps replays fresh and stops players memorising a solution. It also makes the reliability rating meaningful without being unfair: the game never lies outright, it just isn't sure.

An optional extra: players place up to three pins on the map ("check here first") that stay visible as faint markers during the mission. It rewards planning without giving away the layout.

## Vision and fog of war

The camera is top-down and centred on the operator, but the screen only reveals what the operator can actually see. A cone of vision (around 60 degrees, plus a short radius all round for peripheral awareness) is cast from the operator's position and blocked by walls and closed doors. Everything outside it is dark.

**Three layers of knowledge**

- **Visible:** fully lit, enemies and items shown in real time.
- **Remembered:** rooms already seen stay drawn as a dim outline. Furniture and walls remain, but enemies don't. If someone walked in after you left, you won't know.
- **Unknown:** pure black. Not even walls are shown.

Memorising the briefing map isn't required, because the game draws what you've seen as you go. But players who remember the plan know where the next door leads before they open it, and that's a real edge.

**Sound as information**

Sound fills the gaps that vision leaves. Footsteps, a door creaking or a suspect shouting appear as a brief ripple on screen at roughly the right position, even through walls. It's vague on purpose: you know something is in the next room, not exactly where. The operator's own actions make noise too. Running is loud, walking is quiet, and gunfire is unsuppressed, so a single shot alerts the whole building.

**No map during the mission**

Once deployed, the briefing is gone. What players remember and what they've already seen on screen is all they have, which is exactly what makes the briefing screen worth reading.

## Combat and controls

Combat is real time, fast and lethal on both sides: one or two hits down an enemy, and three hits take the operator out (body armour absorbs the first). That makes every corner tense and keeps missions short.

**Core actions**

- **Move** at walking pace by default, with a sprint that's faster but loud.
- **Aim:** the operator always aims down the sights, and a laser runs from the weapon to the first wall or person it hits, so players see exactly where a shot will land. Moving makes the laser wobble; standing still steadies it, so stopping before a doorway becomes a natural habit.
- **Shoot** wherever the laser points.
- **Doors** are the heart of the game. The first version has a single action: open or close. Later versions add a small door menu: open slowly, kick open (fast, loud, stuns anyone right behind it) or peek (crack it open to see a slice of the room).
- **Secure civilians:** hold a button next to a civilian to get them on the ground and out of the line of fire. It adds to the score.
- **Reload** manually, with a limited number of magazines.

**Controls on web**

WASD to move, mouse to aim, left click to shoot, E or right click to open or close a door, R to reload and Shift to sprint.

**Controls on iOS (later)**

Parked until after a successful web release. The laser helps here, because touch players can see exactly where they're pointing. A left stick for movement and a right stick that aims and fires on release is the likely setup.

## Enemies and civilians

The AI doesn't need to be clever; it needs to be readable. Players should be able to learn how each type behaves and predict it, with enough variation that no room plays out the same twice.

| Type | Weapon | Behaviour | First appears |
| --- | --- | --- | --- |
| Lookout | Handgun | Stationary, faces a door or window. Alerts nearby enemies if he sees you. | Officer campaign |
| Patroller | Handgun | Walks a fixed route between rooms. Makes footstep sounds you can track. | Officer campaign |
| Hider | Shotgun | Waits behind furniture or in a corner, only fires at close range. Punishes rushing. | Senior Officer campaign |
| Heavy | Rifle, armour | Takes extra hits, pushes towards noise. | Sergeant campaign |

**AI states**

Each enemy runs a simple state machine with three states: Idle (standing or patrolling), Alert (heard something, moves to investigate) and Combat (sees you, shoots or takes cover). Noise pushes nearby enemies from Idle to Alert, which is what makes careful play pay off.

A fight splits them by temperament. **Pushers** come for you, fast and loud, so you can hear them coming. **Holders** dig in: they take a spot a few tiles back from the door you'd come through, aim at it and wait. Going loud never empties a building by itself; the rooms with someone covering the door still have to be cleared.

**Difficulty rises with rank**

Each campaign is harder than the one before. From one rank to the next, enemies react faster, notice the operator sooner, aim tighter and fire more often. The Officer campaign sets the baseline; by Lieutenant, reactions are close to twice as fast. New enemy types arrive on top of that: the Hider in the Senior Officer campaign, the Heavy with the Sergeant campaign.

**Civilians**

Civilians panic, run or freeze and sometimes block a doorway. Hitting one costs a large score penalty and the second star, but the mission carries on. Securing them adds to the score. On early levels they wear bright clothing and stay clearly visible, so players aren't punished for things they couldn't read.

**Randomisation**

Each level defines a pool of possible enemy spawns per room. On deploy, the game picks the actual set based on the briefing range and reliability. Positions and types vary; the layout doesn't.

## Loadout and progression

Players start with a small kit and unlock new guns on promotion. There are no gadgets for now, so each new weapon has to change how the game plays.

**Starter kit**

- **Pistol** with 3 spare magazines: accurate, low capacity. Always carried as a sidearm.
- **Light body armour:** absorbs one hit.
- **Weapon light:** always on. In dark rooms the operator sees as far as it reaches, which is much less than in lit rooms.

**Gun unlocks**

| Gun | Trade-off | Unlocked at |
| --- | --- | --- |
| Pistol | Accurate and quick, but small magazine | Start |
| Shotgun | Devastating up close, wide spread risks civilians, slow to reload | Officer |
| Assault rifle | Accurate at range, loud and slower to swing round corners | Senior Officer |
| Sniper rifle | One hit stops anyone at any range; scope; bolt action, very slow to swing | Sergeant |
| Suppressor | Shots are heard about a third as far. Fits everything but the shotgun | Lieutenant |

Before each mission players pick one primary gun and always carry the pistol. Handling matters as much as damage: heavier guns make the laser wobble more and turn more slowly, so the shotgun or pistol is often the better pick for tight houses even once the rifle is unlocked. Suppressors come last on purpose: by then players can replay earlier cases quietly for the stars they missed.

**Specialty missions.** Every campaign has at least one case with a twist of its own. A specialty mission can also issue its own gun, so it can come before the gun is earned.

Twists hang off one moment, the **alarm**: the first time a suspect sees the operator, or anyone fires or shouts. Each twist is one yellow line in the briefing's intel and, where it has a place, a yellow label on the plan. Nothing else to learn.

- **House party** (Fenwick Terrace, Officer): armed men among a crowd of guests who freeze or scatter. Check every target and secure everyone.
- **Hostage on the clock** (Kestrel Road, Officer): one of the homeowners is held in a back bedroom. Once the alarm goes up, a 30-second clock runs at the top of the screen; secure the hostage before it hits zero or the mission fails.
- **Evidence** (Corvan Head Office, Senior Officer): when the alarm goes up, the nearest suspect runs for the shredder. Stop him before he has had eight seconds there, or the files are gone and so is the first star.
- **Close quarters** (Salter Street, Senior Officer): a lodging house of narrow corridors, closed doors and beds to hide behind. Made for the shotgun.
- **Rooftop overwatch** (planned, Sergeant): from a roof across from a yard, with the camera pulled right out and sight over the containers. Once you fire, the suspects run for their van: nobody leaves.

**The scope.** Holding Space with the sniper rifle braces the operator: they stop moving, a narrow strip of vision reaches far down the aim, and the camera pulls back and pushes out along it. Enemies can't see that far, so a careful shooter goes unseen until the first shot, which, unsuppressed, brings everyone running.

**Damage and armour.** Street-level suspects in the Officer campaign go down to one hit. From the Senior Officer campaign on they wear light vests and take two, and the briefing says so. That is what gives each gun a job:

- **Pistol:** one hit per shot, so a vested suspect needs a double tap.
- **Shotgun:** one hit per pellet, so a full spread stops anyone in one shot up to about six tiles. Past that the pellets scatter, and they can hit civilians next to the target.
- **Assault rifle:** each round counts double, so one hit stops a vested suspect at any range.
- **Sniper rifle:** each round counts triple, enough for the heavier armour to come. One shot every second or so.

A hit that doesn't stop a suspect makes them flinch, throwing off their aim for a moment and turning them towards the shooter.

**Scoring and stars**

Each mission ends with a debrief and up to three stars: one for completing it, one for no civilian hit and one for finishing without taking damage. Promotion to the next rank needs a minimum number of stars from the current campaign, which gives players a reason to replay a mission more carefully. There is no time-based score, because it would push players to rush.

## Training, levels and story

The game opens at the police academy range, then follows the operator through four campaigns, one per rank. Every level is a single ground floor for now; multiple floors can come later.

**Training: the Range**

A classic wooden shooting range with plywood walls and cardboard targets teaches every mechanic without walls of text. It runs as a short sequence of stations:

- **Movement lane:** walk, sprint and notice how sprinting is loud.
- **Target lane:** aim with the laser, feel it wobble while moving and steady when stopped.
- **Door station:** open plywood doors, with pop-up targets behind them.
- **Shoot or don't:** cardboard targets showing either a suspect with a gun or a civilian, which teaches the penalty early.
- **Kill house:** a small wooden building with the lights off, combining everything. It's also a good place to try out a newly unlocked gun.

**Levels**

Levels are built on a tile grid of 32 px tiles, which makes line of sight, enemy movement and the briefing map easy to generate from the same data. The briefing map is a simplified render of the level file with the unknown zones blanked out. Each mission introduces one new idea, so players learn without a tutorial.

**Story and campaigns**

The structure borrows from L.A. Noire, where the protagonist works his way up through police desks and each desk tells part of a bigger story. Here, each rank is a campaign of five missions. The cases look unrelated at first, but a thread runs through them: the small-time dealers raided as a rookie turn out to work for a smuggling ring, which leads to the money men and finally the people running it.

| Rank | Campaign | Locations | Story thread |
| --- | --- | --- | --- |
| Recruit | Academy | The Range | Learn the job |
| Officer | Street crime | Houses | Raids on dealers that keep mentioning the same supplier |
| Senior Officer | Supply chain | Offices, warehouses | A logistics firm that's moving more than parcels |
| Sergeant | Clean money | Hotel floors | The ring's accountants meeting at a city hotel |
| Lieutenant | The top | Villas | The people behind it all, with friends in high places |

The story is told almost entirely through the briefing screen: case files, short radio messages, a photo of a suspect pinned to the map. A promotion screen with a short text from the captain closes each campaign. That's cheap to produce, needs no cutscenes and makes the briefing feel even more important.

Levels will be built in Tiled, a free map editor. A custom editor can wait.

## Art, audio and tone

The art is top-down and readable first, with restrained material detail: wooden floors, concrete and plywood walls, soft contact shadows, and simple figure silhouettes. Colour coding stays strict: blue for the player, red for hostiles, yellow for civilians. That reads well on a small phone screen, and the briefing map keeps its clean blueprint style, so the mission feels like the plan coming to life.

Darkness carries the atmosphere. Unknown areas are near-black, remembered areas dim, and vision fades out towards the edge of its range, so the weapon light in a dark room reads as a beam. Small physical details (bullet holes, spent casings, muzzle flashes) make each room feel used.

Sound is a gameplay system, not decoration: footsteps, door creaks, radio chatter at the start ("Team, you're cleared to enter") and a short sting when the site is secured. Free libraries such as Freesound or Kenney's packs cover the basics.

The tone is grounded and serious. Blood is an optional effect, on by default: a short spray on a hit and a pool under someone who is down, never gore, and never on the training range's cardboard props. With it switched off, downed people simply fall and fade, which keeps the age rating reasonable on the App Store and stays respectful given the subject. The game uses no real place names or real organisations' logos.

## Tech plan

The game is built once as a web game, and the same code is wrapped for iOS later rather than writing two games.

- **Engine:** Phaser 3 with TypeScript: a free, well-documented 2D game framework for the browser with built-in support for tile maps, keyboard and touch input, and sound.
- **Line of sight:** a raycast visibility polygon from the operator's position against wall edges.
- **Levels:** made in Tiled and exported as JSON, which Phaser reads natively.
- **Hosting:** GitHub Pages. Every push to the repository runs a GitHub Action that builds and publishes the game.
- **Saves:** progress (stars, unlocks) in the browser's local storage. On iOS it carries over inside the app.
- **Path to iOS:** Capacitor wraps the web build into a native Xcode project. This requires a Mac, Xcode and an Apple Developer account. Apple accepts wrapped web games when they feel like a proper app, so offline play, touch controls and no browser-looking UI are a must.

The game is designed for touch and a 16:9 phone screen from day one. Retrofitting touch controls onto a mouse-and-keyboard game is the most common reason these ports feel bad.

## Roadmap and MVP scope

The biggest risk with a game like this is building too much before finding out whether the core is fun. So the first milestone is one room, not one campaign.

1. **Prototype: the Range.** Movement, vision cone, laser aim, doors and cardboard targets. The training level doubles as the test bed, so nothing gets thrown away. The question to answer: does walking through a door into darkness feel tense?
2. **Vertical slice: first Officer mission.** Briefing screen, one house, two enemy types, civilians, the debrief with stars. Published on GitHub Pages for a small group of playtesters.
3. **MVP: Academy plus the Officer campaign.** First case file story, sound ripples, local saves, promotion to Senior Officer.
4. **Full web release: all four campaigns.** All guns, polish, audio, a proper title screen.
5. **iOS, after a successful web release.** Touch controls, Capacitor wrap, offline support and App Store review.

Cut on purpose for now: shouting and arrests, hostages, gadgets, multiple floors, squad members and multiplayer. All good candidates for later updates.

**Realism mode.** A separate career with one life, chosen from the start menu next to the normal career; each has its own progress. Going down ends a realism career and it resets to Recruit. There is no restarting a mission, and quitting one (or closing the game mid-mission) counts as going down. A new realism career can skip the academy and start as an Officer.

## Decisions

- **Solo operator**, no squad.
- **Real time**, no tactical pause.
- **Civilian hit = penalty**, not mission failure.
- **No briefing map** during the mission.
- **Minimal HUD:** ammo and short messages only. There is no objective checklist; every mission is to secure the area. Tutorial text appears only on the Range.
- **Blood effects** are a setting, on by default, and never shown on training props.
- **Realism mode:** a separate career with one life; going down ends it and resets it to Recruit. It can skip the academy.
- **Tall objects block sight and bullets:** racking, lorries, containers and vans. Low furniture and cars are cover you can see and shoot over.
- **No flashlight toggle:** the weapon light is always on; dark rooms simply limit how far you see.
- **Every level opens with a short intro:** the operator approaching the chosen entry while radio lines play. It can be skipped.
- **Five missions per campaign**, so 20 missions plus the Range for the full web release.
- **Enemies can't see the laser.**
- **Guns are unsuppressed** for now; a suppressor comes later as an unlock and cuts how far shots are heard.
- **Vision cone of about 60 degrees.**
- **Doors open and close only** in the first version; kick and peek come later.
- **Port Ardley**, a fictional harbour city, with Breach as the working title.
- **Web first**, iOS only after a successful web release.
