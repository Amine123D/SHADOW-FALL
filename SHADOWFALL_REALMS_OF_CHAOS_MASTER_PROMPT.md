# MASTER GAME DEVELOPMENT PROMPT

# SHADOWFALL: REALMS OF CHAOS

## Complete Cross-Platform 2D Action RPG — Phaser 3 + TypeScript

***

# 1. PROJECT MISSION

Build **SHADOWFALL: REALMS OF CHAOS**, an original, premium-quality 2D pixel-art action RPG featuring responsive action-platform combat, deep character progression, challenging bosses, extensive equipment customization, interconnected regions, exploration, secrets, and a mysterious fantasy storyline.

The result must be a genuinely playable, stable, extensible game—not a landing page, static mockup, menu-only prototype, disconnected collection of systems, or demonstration in which most buttons do nothing.

The project must begin with a polished vertical slice that establishes the complete gameplay loop. Expand into the full game only after the vertical slice passes its acceptance tests.

### Core principles

1. Playability before content quantity.
2. Functional systems before decorative interfaces.
3. Responsive, skill-based combat before stat inflation.
4. Original art and audio rather than copied commercial assets.
5. Offline-first architecture without mandatory accounts.
6. Mobile performance and touch controls as first-class requirements.
7. Data-driven systems that support future expansion.
8. Automated testing and reproducible builds.
9. Honest reporting of implemented, partially implemented, and planned features.
10. No paid services or proprietary API keys required to build and play the game.

### Target platforms

- Android phones and tablets through a mobile browser, with optional Capacitor packaging later.
- iPhone and iPad through a mobile browser, with optional Capacitor packaging later.
- Windows, macOS, and Linux through supported desktop browsers.
- Optional installable Progressive Web App (PWA).
- Optional desktop packaging after browser functionality is stable.

### Technology stack

Use one coherent, supported architecture:

- Phaser 3 for game rendering, scenes, input, cameras, and physics integration.
- TypeScript in strict mode.
- Vite for development and production builds.
- HTML5 Canvas/WebGL rendering through Phaser.
- Vitest for unit and integration-oriented logic tests.
- Playwright for browser-level smoke tests and essential gameplay checks.
- IndexedDB for persistent browser saves, preferably through a lightweight, maintained wrapper or a carefully implemented repository.
- Web Audio API or Phaser audio systems for sound.
- GitHub Actions for automated validation, production builds, and deployment.
- Capacitor as an optional future packaging layer.

Pin compatible dependency versions and commit the package-manager lockfile. Do not mix Phaser with Godot, Unity, or another game engine.

***

# 2. NON-NEGOTIABLE IMPLEMENTATION RULES

The development agent must follow these rules throughout the project.

- Implement a working feature before marking it complete.
- Do not replace gameplay with screenshots, prerecorded animations, or mock UI.
- Do not create fake buttons that have no meaningful behavior.
- Do not simulate successful saving without actually persisting and restoring data.
- Do not use random damage or arbitrary collision shortcuts as substitutes for real combat logic.
- Do not silently discard player progress after a reload or interrupted session.
- Do not invent successful test results, build results, deployments, or platform compatibility.
- Do not leave critical systems as TODO comments.
- Do not hide missing content behind locked menus that imply it is implemented.
- Do not introduce network dependencies into the core offline gameplay loop.
- Do not require an account, paid subscription, external game server, or paid AI API.
- Do not place secrets, signing keys, or credentials in source control.
- Do not overwrite existing user work or change an established repository's structure without inspecting it first.
- Preserve existing repository history and configuration when working in an existing repository.
- Keep the game playable at the end of every development milestone.

When a requested feature is too large to complete at once, implement a small but complete version, document its boundaries, and establish an extension path.

**Definition of done:** code exists, the feature is connected to the actual game, its expected behavior has been tested, its failure cases are handled, and the documentation accurately describes its status.

***

# 3. ORIGINAL IP AND CREATIVE DIRECTION

Create an original intellectual property. Darkrise and other action RPGs may inform broad genre expectations, but must not be copied.

Do not reproduce commercial games' source code, maps, character designs, sprites, names, dialogue, soundtracks, distinctive UI artwork, or other protected expression.

Create original:

- Characters and class identities.
- Enemies and boss designs.
- Environments and level layouts.
- Skill animations and combat effects.
- Lore, dialogue, quests, and endings.
- Music, sound effects, icons, and UI artwork.

Use original generated artwork, original procedural pixel art, or appropriately licensed resources. Keep asset licensing records.

If a complete animation is unavailable, create a cohesive original pixel-art animation from reusable components or hand-authored frames. Do not disguise generic placeholders as finished art.

***

# 4. WORLD, LORE, AND NARRATIVE

The continent of Elarion was protected by seven ancient celestial seals. These seals imprisoned a force known as the Unmaking, an intelligence that existed before the first kingdom.

When the seals shattered, fragments of its power spread throughout the world. Kingdoms collapsed, creatures transformed, and memories began disappearing from places touched by the corruption.

The player is a newly awakened Wayfarer capable of channeling fragments of this force without immediately surrendering to it.

The story should gradually reveal:

- Who created the seven seals.
- Why the seals were deliberately weakened.
- What the ancient kingdoms concealed.
- Why the player can survive contact with the Unmaking.
- How rival factions interpret the catastrophe.
- Whether the corrupted can be restored.
- What happens if the seals are repaired, transformed, or destroyed.

### Narrative delivery

Tell the story through exploration, NPC dialogue, environmental storytelling, boss encounters, collectible journals, optional quests, and consequential decisions.

Avoid excessive exposition. Give locations a recognizable history, and allow optional discoveries to add meaning without blocking the main story.

### Choices and endings

Create meaningful decisions that influence selected quests, alliances, characters, and the final outcome.

Provide multiple endings determined by documented, persistent world-state flags. Endings must result from actual recorded decisions and completed objectives, not arbitrary random selection.

***

# 5. ART DIRECTION AND RENDERING

Develop a cohesive, detailed pixel-art style with clear silhouettes, controlled palettes, readable combat, and intentional animation.

### Visual requirements

- Crisp pixel edges with consistent sprite scale.
- Original animated characters and enemies.
- Multi-layer parallax backgrounds.
- Distinct foreground, middle-ground, and background layers.
- Atmospheric fog, shadows, particles, and magical lighting.
- Carefully designed terrain, architecture, ruins, trees, crystals, and props.
- Readable attack telegraphs and hit effects.
- Camera tracking with configurable impact shake.
- Animation anticipation, attack frames, recovery, and hit reactions.
- Optional environmental weather and time-of-day variations.
- Cohesive menus, maps, inventory screens, icons, and dialogue panels.

Use a consistent virtual resolution and integer scaling where practical. Avoid blurry pixel-art scaling and inconsistent asset proportions.

### Animation states

Player animation should support, where appropriate:

- Idle.
- Walk and run.
- Jump ascent.
- Falling.
- Landing.
- Basic attacks.
- Heavy attacks.
- Skill casting.
- Dodge.
- Taking damage.
- Stagger.
- Death.
- Victory.
- Interaction.

Use animation state machines to prevent incompatible animations from playing simultaneously.

Animation events may request attacks or trigger effects, but the authoritative combat simulation must determine damage and collision.

### Graphics settings

Provide Low, Balanced, and High visual settings.

Low settings should reduce expensive particles and visual effects. High settings may add lighting, ambient effects, and decorative particles.

Also provide reduced screen shake, reduced flashing, and reduced-motion options.

***

# 6. GAMEPLAY ARCHITECTURE

Organize the source code into clear, independently testable modules.

Suggested structure:

```text
shadowfall/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy-pages.yml
├── public/
│   ├── assets/
│   │   ├── sprites/
│   │   ├── tilesets/
│   │   ├── backgrounds/
│   │   ├── audio/
│   │   ├── fonts/
│   │   └── ui/
│   ├── favicon.svg
│   ├── manifest.webmanifest
│   └── icons/
├── src/
│   ├── main.ts
│   ├── game/
│   │   ├── config.ts
│   │   ├── constants.ts
│   │   └── GameRegistry.ts
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── PreloadScene.ts
│   │   ├── TitleScene.ts
│   │   ├── CharacterScene.ts
│   │   ├── WorldScene.ts
│   │   ├── UIScene.ts
│   │   ├── InventoryScene.ts
│   │   ├── PauseScene.ts
│   │   └── EndingScene.ts
│   ├── entities/
│   │   ├── Player.ts
│   │   ├── Enemy.ts
│   │   ├── Projectile.ts
│   │   └── Companion.ts
│   ├── systems/
│   │   ├── InputSystem.ts
│   │   ├── CombatSystem.ts
│   │   ├── AbilitySystem.ts
│   │   ├── StatusEffectSystem.ts
│   │   ├── EnemyAISystem.ts
│   │   ├── BossSystem.ts
│   │   ├── LootSystem.ts
│   │   ├── InventorySystem.ts
│   │   ├── ProgressionSystem.ts
│   │   ├── QuestSystem.ts
│   │   ├── DialogueSystem.ts
│   │   ├── WorldSystem.ts
│   │   ├── AudioSystem.ts
│   │   └── SaveSystem.ts
│   ├── data/
│   │   ├── classes.ts
│   │   ├── abilities.ts
│   │   ├── enemies.ts
│   │   ├── bosses.ts
│   │   ├── items.ts
│   │   ├── quests.ts
│   │   ├── regions.ts
│   │   └── balance.ts
│   ├── ui/
│   ├── persistence/
│   ├── localization/
│   ├── accessibility/
│   ├── utils/
│   └── styles/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── .gitignore
├── README.md
├── LICENSE
└── CONTRIBUTING.md
```

This is a proposed organization, not a requirement to create empty files for every system. Add modules as their implementations become necessary.

### Architectural requirements

- Enable TypeScript strict mode.
- Keep combat calculations independent of rendering.
- Keep game content separate from presentation.
- Use typed data definitions for game entities and items.
- Separate persistent state from transient animation state.
- Define explicit ownership and cleanup for scenes, timers, event listeners, and entities.
- Use dependency injection or small interfaces where they improve testing.
- Avoid circular imports and giant classes containing every system.
- Validate externally loaded save data before using it.
- Keep balance constants centralized and tunable.

Use Phaser Arcade Physics for suitable platforming and overlap detection. Implement custom combat hitboxes and collision logic where Arcade Physics alone is insufficient.

Do not build a heavyweight custom engine when Phaser already provides the required capabilities.

***

# 7. DEVELOPMENT ROADMAP

Implement the game in the following order. Do not skip ahead to mass content generation before the foundation is stable.

## Milestone 1 — Playable vertical slice

Create one complete playable level in the Ashen Frontier.

Required features:

- Functional title screen and new-game flow.
- One fully playable class: Vanguard.
- Responsive keyboard controls.
- Functional mobile touch controls.
- Walking, jumping, falling, collision, and grounded movement.
- Basic attacks, dodge, and at least three usable abilities.
- At least three functional enemy archetypes.
- One elite encounter.
- One original multi-phase boss.
- Damage, health, knockback, and death.
- XP, leveling, and a functional reward.
- At least eight functional equipment examples.
- Inventory, equipment, and item comparison.
- At least one rarity-driven loot system.
- A checkpoint.
- Persistent local saving and loading.
- Pause and settings menus.
- Music/effects volume controls.
- Original visual and audio assets.
- Automated tests.
- A production build that runs successfully.

### Vertical-slice acceptance test

A new player must be able to:

1. Start the game.
2. Create a character.
3. Enter the Ashen Frontier.
4. Move and jump across platforms.
5. Fight enemies using actual hit detection.
6. Dodge or respond to enemy attacks.
7. Earn XP and level up.
8. Receive and equip loot.
9. Defeat the boss using its readable attack patterns.
10. Reach the checkpoint.
11. Save and reload without losing progress.
12. Complete the sequence using touch controls on a mobile browser.

A feature does not pass because its button exists. It must work in a real gameplay session.

## Milestone 2 — Core RPG systems

Expand the vertical slice with:

- A functional skill tree.
- At least two viable Vanguard builds.
- All six initial classes.
- Shared and class-specific progression.
- Additional enemy archetypes.
- Expanded equipment categories.
- Working crafting and merchant systems.
- Main and side quests.
- A world map and region transitions.
- Better save recovery and migration.
- Audio and accessibility options.

## Milestone 3 — World expansion

Implement all eight major regions, interconnected routes, secrets, checkpoints, optional challenges, region-specific enemies, and boss encounters.

Expand the class roster toward all 12 classes.

## Milestone 4 — Full-release content

Expand toward the full targets:

- 12 playable classes.
- At least 50 enemy variants.
- At least 15 major bosses.
- Eight major regions.
- Extensive equipment and crafting.
- Multiple story endings.
- Companion progression.
- Endgame dungeons and challenges.
- Localization, accessibility, and performance improvements.

## Milestone 5 — Release readiness

Complete regression testing, performance profiling, asset licensing review, browser compatibility checks, PWA verification, documentation, and release builds.

Never describe later milestones as complete until their acceptance criteria have been met.

***

# 8. CHARACTER CLASSES

The full-release target is 12 distinct classes. Every class must have a unique combat identity, animations, resources where appropriate, a progression tree, and meaningful build options.

The initial six classes must be implemented before the remaining classes are treated as finished content.

## Class 1: Vanguard

Role: durable melee fighter.

Signature abilities:

- Sweeping Strike.
- Defensive Stance.
- Forward Rush.
- Ground Shockwave.
- Colossus Break — ultimate.

Combat identity: controlled aggression, guarding, knockback, and heavy attacks.

## Class 2: Arcanist

Role: elemental spellcaster.

Signature abilities:

- Arcane Bolt.
- Flame Burst.
- Frost Field.
- Short-range Blink.
- Astral Cataclysm — ultimate.

Combat identity: resource management, elemental interactions, and controlled area damage.

## Class 3: Ranger

Role: mobile ranged attacker.

Signature abilities:

- Piercing Shot.
- Multi-projectile Volley.
- Root Trap.
- Evasive Leap.
- Storm of Thorns — ultimate.

Combat identity: positioning, precision, traps, and ranged pressure.

## Class 4: Shade

Role: agile melee specialist.

Signature abilities:

- Shadow Dash.
- Phantom Afterimage.
- Marked Target.
- Multi-hit Combo.
- Eclipse Dance — ultimate.

Combat identity: fast attacks, repositioning, combo chains, and high-risk openings.

## Class 5: Runebinder

Role: tactical battlefield controller.

Signature abilities:

- Explosive Rune.
- Defensive Ward.
- Rune Detonation.
- Temporary Familiar.
- Ancient Convergence — ultimate.

Combat identity: preparation, rune placement, and combinations between abilities.

## Class 6: Warden

Role: protector and spectral summoner.

Signature abilities:

- Spectral Companion.
- Protective Barrier.
- Spirit Pulse.
- Guardian Leap.
- Eternal Sentinel — ultimate.

Combat identity: defense, companion synergy, controlled engagement, and survival.

## Unlockable classes

7. **Stormcaller:** chain lightning, wind movement, and area control.
8. **Chronomancer:** time distortion, temporary echoes, and cooldown manipulation.
9. **Beastkeeper:** companions, creature synergy, and tactical pet commands.
10. **Soulweaver:** spirit energy, soul-based magic, and healing trade-offs.
11. **Machinist:** clockwork companions, deployable devices, and mechanical traps.
12. **Voidwalker:** gravity manipulation, portals, and high-risk magical combos.

### Class implementation contract

Every fully released class must have:

- At least 10 functional active or passive abilities.
- A distinctive resource or combat mechanic where appropriate.
- A unique ultimate.
- A functional progression tree.
- Multiple viable builds.
- Class-compatible equipment.
- Appropriate animations and combat feedback.
- A tutorial or readable explanation.
- Automated tests for critical ability behavior.

Do not implement 12 classes by simply changing a character's color and damage multiplier.

Classes must be unlockable through fair gameplay. Never require payment to access core classes.

***

# 9. CHARACTER CREATION AND CUSTOMIZATION

Implement:

- Character naming.
- Class selection.
- Multiple hairstyles and hair colors.
- Compatible skin palettes and facial details.
- Outfit color customization.
- Unlockable costumes and cosmetic effects.
- An animated character preview.
- Multiple character save slots.
- Character selection with level, class, progress, and equipment information.

Equipment should visibly alter the character where practical.

Cosmetics must remain separate from gameplay balance.

Validate character names and prevent invalid values from corrupting saved data.

***

# 10. PLAYER MOVEMENT AND COMBAT

Build a responsive real-time 2D action-platform combat system.

### Movement

Implement:

- Left/right movement.
- Jumping and falling.
- Platform collision.
- Ground detection.
- Landing behavior.
- Optional jump buffering and coyote time.
- Responsive acceleration and deceleration.
- Knockback and recovery.
- Dodge or evasive movement.
- Moving-platform support if used by the level design.

Prevent players from jumping indefinitely, passing through solid terrain, or becoming permanently stuck in collision states.

### Combat

Implement:

- Basic and class-specific attacks.
- Heavy attacks where appropriate.
- Skill buttons.
- Attack chaining.
- Grounded and airborne attacks where supported.
- Cooldowns.
- Resource consumption and regeneration.
- Hit stun and recovery.
- Knockback.
- Critical hits.
- Damage numbers.
- Status effects.
- Projectile collision.
- Enemy telegraphs.
- Boss health displays.
- Victory and defeat states.
- Loot drops and pickup interactions.

### Combat authority

Combat must be resolved by deterministic, testable game logic rather than visual appearance alone.

Use explicit hitboxes, hurtboxes, attack windows, cooldown rules, and damage calculations.

Ensure each attack cannot apply unintended repeated damage on every rendered frame.

Define how armor, resistance, critical hits, status effects, invulnerability, and damage-over-time effects interact.

Use a fixed or controlled simulation timestep for combat-sensitive logic where appropriate.

Visual effects must not obscure essential attack warnings.

### Example damage model

Define and document a tunable formula, for example:

- Base attack damage.
- Applicable attack scaling.
- Critical-hit multiplier when a critical hit occurs.
- Target defense and resistance.
- Explicit damage modifiers.
- Defined rounding and minimum-damage rules.

The formula must be implemented once in the authoritative combat system rather than duplicated across classes.

Avoid making damage calculations so complicated that the player cannot understand why an attack succeeded or failed.

***

# 11. CONTROLS AND INPUT

## Mobile

Provide:

- A virtual joystick or directional pad.
- Jump.
- Primary attack.
- At least four configurable skill slots.
- Dodge.
- Interact.
- Inventory.
- Pause.
- Optional controller support.

Support different screen sizes and aspect ratios.

Allow adjustment of button size, opacity, and layout. Provide a control-layout reset option.

Prevent unwanted browser scrolling, text selection, and gesture zoom during active gameplay where supported, without breaking accessibility or menu navigation.

Do not place skill buttons beneath device safe areas, browser overlays, or critical HUD elements.

## Desktop

Provide:

- Keyboard and mouse controls.
- Remappable keys.
- Optional gamepad support.
- Fullscreen and windowed play.
- Adjustable UI scaling.
- A visible control guide.

Avoid hard-coded assumptions about keyboard layouts.

## Input state management

Support simultaneous movement and attacks when allowed by the combat design.

Handle pointer release, focus loss, scene changes, and app suspension so that a held attack or direction cannot remain permanently active.

Pause appropriately when focus is lost, and allow the player to resume safely.

***

# 12. ENEMY AI

Full-release target: at least 50 distinct enemy variants.

Organize enemies into families:

- Corrupted wildlife.
- Ancient guardians.
- Undead creatures.
- Crystal entities.
- Shadow creatures.
- Mechanical constructs.
- Cursed knights.
- Elemental spirits.
- Elite champions.
- Dimensional aberrations.

Support multiple combat roles:

- Melee attackers.
- Ranged attackers.
- Flying enemies.
- Defensive enemies.
- Summoners.
- Support units.
- Ambush enemies.
- Elite variants.
- Rare modifiers.
- Boss minions.

### AI states

Use a documented state machine containing appropriate states such as:

- Idle.
- Patrol.
- Detect.
- Approach.
- Attack.
- Recovery.
- Stagger.
- Retreat where appropriate.
- Defeat.

Enemies must consider the player's position, attack range, terrain, and current state.

They must not simply stand still and lose health unless that behavior is a deliberate enemy mechanic.

Implement attack telegraphs and recovery windows that communicate counterplay.

Rare modifiers may alter movement, resistance, attack patterns, or rewards. Display dangerous modifiers clearly.

### Performance

Avoid expensive AI updates for distant enemies. Use distance-aware updates and sensible active-enemy limits without breaking combat consistency.

***

# 13. BOSS ENCOUNTERS

Full-release target: at least 15 original major bosses.

Each major boss requires:

- An original design and silhouette.
- A dedicated arena.
- Distinct attacks.
- Readable telegraphs.
- Multiple phases.
- At least two phases, with three where appropriate.
- A unique audio identity.
- Unique rewards.
- A victory sequence.
- A journal entry.
- A connection to the story.

Example bosses:

- The Hollow King.
- Mother of Glass.
- The Iron Colossus.
- The Drowned Oracle.
- The Thorn-Crowned Beast.
- The Starless Dragon.
- The Keeper of Hours.
- The Sevenfold Echo.

These are original working names that may be expanded or refined.

### Boss state machine

Implement explicit transitions between:

- Introduction.
- Active phase.
- Telegraph.
- Attack.
- Recovery.
- Phase transition.
- Defeat.
- Reward sequence.

Bosses must not change phases repeatedly because of floating-point errors, duplicate damage events, or animation callbacks.

Phase transitions should occur at defined thresholds or encounter events and should be tested.

### Vertical-slice boss

The first boss must be a complete encounter with at least two mechanically distinct phases, attack warnings, damage windows, defeat handling, and persistent reward progression.

Do not substitute a large health bar for interesting mechanics.

***

# 14. WORLD AND LEVEL DESIGN

Build eight major regions:

1. Ashen Frontier — ruined villages, forests, and early-game enemies.
2. Sunken Catacombs — underground passages and ancient tombs.
3. Crystal Wastes — dangerous crystal formations and elemental creatures.
4. Ironfall Citadel — mechanical ruins and armored guardians.
5. Whispering Wilds — dense forests, hidden paths, and nature spirits.
6. Frozen Expanse — slippery terrain, storms, and ice-based enemies.
7. The Astral Rift — strange dimensions and shifting platforms.
8. The Shattered Throne — the final region and story climax.

Each region should contain multiple interconnected levels, secrets, optional challenges, treasures, elite encounters, and regional bosses.

### World systems

Implement:

- World map.
- Minimap where useful.
- Checkpoints.
- Fast travel between discovered locations.
- Hidden rooms.
- Breakable objects.
- Secret passages.
- Optional platforming challenges.
- Region-specific collectibles.
- Region unlock conditions.
- Persistent discovered-location flags.

Handcraft the main routes and boss arenas. Use controlled procedural variation for suitable encounters and loot.

Represent level layouts with reusable, data-driven definitions. Avoid generating arbitrary platforms that make the game unfair or impossible to complete.

### Level transition requirements

Transitions must safely:

1. Save relevant progress.
2. Remove or suspend old scene resources.
3. Load the destination.
4. Restore the correct player state.
5. Update the minimap and world progression.
6. Preserve quest and boss states.
7. Avoid duplicating enemies, timers, or event listeners.

***

# 15. PROGRESSION AND DIFFICULTY

Implement:

- XP and character levels.
- Stat growth.
- Class-specific skill trees.
- Active and passive skills.
- Equipment upgrades.
- Attribute allocation where appropriate.
- Earnable talent respecs.
- Main and side quests.
- Region unlocks.
- New Game Plus or an equivalent endgame system.

### Difficulty settings

**Adventurer:** forgiving damage, more generous recovery windows, and a focus on exploration.

**Veteran:** intended baseline challenge with balanced enemy behavior and rewards.

**Nightmare:** more demanding encounters, more aggressive enemy patterns, and improved reward opportunities.

Difficulty must modify actual game behavior. Do not merely change a menu label.

Ensure each difficulty remains fair, readable, and beatable.

### Endgame

Expand toward:

- Endless challenge floors.
- Elite rematches.
- Rotating offline challenge modifiers.
- Timed trials.
- High-level dungeons.
- Boss rematches.
- Rare equipment hunts.
- Collection achievements.
- New Game Plus.
- Alternative builds for every class.

Offline weekly-style challenges should use locally available challenge rotations rather than requiring a server or a continuously connected clock.

Prevent progression from becoming an excessive grind. Every region should introduce meaningful mechanics, choices, or rewards.

***

# 16. EQUIPMENT AND LOOT

Implement at least eight equipment categories:

1. Main-hand equipment.
2. Off-hand equipment.
3. Headgear.
4. Chest armor.
5. Gloves.
6. Boots.
7. Accessories.
8. Relics.

Use six rarity tiers:

1. Common.
2. Uncommon.
3. Rare.
4. Epic.
5. Legendary.
6. Mythic.

### Item properties

Support suitable combinations of:

- Attack power.
- Defense.
- Health.
- Critical chance.
- Critical damage.
- Attack speed.
- Movement speed.
- Elemental damage.
- Elemental resistance.
- Cooldown reduction.
- Resource regeneration.
- Life recovery.
- Status-effect chance.
- Class-specific modifiers.

### Advanced equipment

Add:

- Randomized affixes.
- Unique named equipment.
- Equipment sets.
- Socketed gems.
- Gem upgrades.
- Crafting materials.
- Forging.
- Eligible property rerolls.
- Equipment comparison.
- Item locking.
- Sorting and filtering.
- Sell and dismantle options.
- Loot filters.
- Automatic pickup settings.
- Saved equipment loadouts.

### Loot generation

Create a centralized, seeded loot generator for testable and reproducible results.

Use weighted rarity probabilities, item-level constraints, equipment compatibility, affix pools, and guaranteed valid outcomes.

Prevent:

- Impossible affix combinations.
- Negative or non-finite statistics.
- Invalid class equipment.
- Duplicate unique items where the rules forbid them.
- Empty or corrupt item definitions.
- Rare items that are systematically inferior without a meaningful trade-off.

Balance loot so that rarity signals potential, not automatic superiority.

***

# 17. INVENTORY AND CRAFTING

Build a complete, functional inventory system.

### Inventory features

- Equipment slots.
- Item descriptions.
- Item comparison.
- Stackable materials.
- Consumables.
- Gems.
- Quest items.
- Storage or stash.
- Search.
- Sorting.
- Filters.
- Equipment loadouts.
- Item locking.
- Confirmation before destroying valuable items.

Inventory operations must preserve item identity and quantities correctly.

Prevent duplication, negative stacks, accidental quest-item deletion, and equipment from disappearing during scene transitions.

### Crafting stations and NPC services

- Blacksmith: equipment upgrades.
- Artificer: gem crafting and upgrades.
- Enchanter: eligible item modifiers.
- Merchant: buying and selling.
- Archivist: lore and collections.

Each service must perform a real operation, validate costs, update the player's inventory, and persist the result.

Display clear failure messages when requirements are not met.

***

# 18. QUESTS, DIALOGUE, AND NPCS

Implement a data-driven quest system supporting:

- Main story quests.
- Side quests.
- Exploration quests.
- Boss contracts.
- Collection challenges.
- Class quests.
- Region-specific events.
NPCs require identifiable roles, original dialogue, and meaningful interactions.

Track objectives accurately, including:

- Enemy defeats.
- Items collected.
- Locations discovered.
- NPC interactions.
- Boss defeats.
- Choices made.
- Items delivered.

### Quest integrity

Quest progress must be updated through authoritative gameplay events rather than UI button presses.

Quest rewards must not be claimed repeatedly unless explicitly intended.

Persist quest stages and objective counts.

Handle interrupted quests and invalid states gracefully.

### Dialogue

Support:

- Multiple dialogue lines.
- Character portraits where appropriate.
- Player response choices.
- Quest-linked dialogue.
- Persistent decisions.
- Localization.
- Keyboard, touch, and controller navigation.

Rewards may include XP, materials, equipment, cosmetics, lore, and region access.

***

# 19. COMPANIONS

Add optional companions with different support roles.

Companions may:

- Help in combat.
- Collect nearby loot if enabled.
- Provide modest passive bonuses.
- Have individual appearances and personalities.
- Unlock dialogue and quests.
- Gain levels or upgradeable abilities.

Companion AI must be efficient and must not play the game automatically.

Define companion attack ranges, cooldowns, follow distances, and recovery behavior.

Ensure companions cannot block the player in narrow passages or permanently interfere with boss mechanics.

***

# 20. AUDIO AND SOUND DESIGN

Create an original soundscape featuring:

- Title-screen music.
- Region-specific music.
- Boss encounter themes.
- Melee impacts.
- Magic and elemental effects.
- Footsteps.
- Jump and landing sounds.
- Enemy attack cues.
- Loot pickup sounds.
- Menu sounds.
- Environmental ambience.
- Weather, machinery, and wildlife where appropriate.

Use original or properly licensed audio and document the source of each external asset.

Provide independent sliders for music, sound effects, and ambience, plus mute controls.

### Technical requirements

- Respect browser audio restrictions and initialize audio after an appropriate user gesture.
- Avoid overlapping identical effects without limits.
- Stop or transition audio safely when scenes change.
- Avoid repeated sound playback caused by duplicate event listeners.
- Persist audio settings locally.
- Provide a fallback when an audio asset fails to load.

Never rely on unlicensed commercial-game music or sound effects.

***

# 21. USER INTERFACE AND EXPERIENCE

Create a polished pixel-inspired interface with consistent spacing, typography, icons, panel styles, and animations.

Required screens, implemented as the associated systems become available:

- Animated title screen.
- New Game.
- Continue.
- Character selection.
- Character creation.
- World map.
- In-game HUD.
- Inventory.
- Character statistics.
- Skill trees.
- Quest journal.
- Equipment details.
- Crafting.
- Merchant.
- Collections.
- Achievements.
- Settings.
- Pause.
- Game over.
- Victory.
- Ending screens.

The UI must reflect actual game state. Do not show invented inventory counts, placeholder rewards, or progress that does not exist.

### HUD

Display essential information:

- Health.
- Class resource where applicable.
- XP and level.
- Skill cooldowns.
- Status effects.
- Relevant quest objectives.
- Boss health during boss encounters.
- Interaction prompts.

Adapt HUD positioning for mobile safe areas and different aspect ratios.

Avoid covering attack telegraphs, platform edges, or essential controls.

### Localization

Support English initially, with architecture for Arabic, French, and other languages.

Use translation keys instead of hardcoding text across gameplay systems.

Support right-to-left layout for Arabic, including text direction, menu alignment, and appropriate UI mirroring.

Use suitable fonts and test mixed-direction text.

***

# 22. SAVE SYSTEM AND OFFLINE-FIRST OPERATION

Implement robust, persistent local saving.

### Persisted state

Save:

- Character identity and appearance.
- Class, level, and XP.
- Attributes and abilities.
- Inventory and equipment.
- Quest progress.
- World progression.
- Boss defeats.
- Discovered locations.
- Crafting and collection progress.
- Companions.
- Achievements.
- Settings.
- Story decisions.

### Storage strategy

Use IndexedDB for browser saves. A lightweight wrapper is acceptable.

Do not rely exclusively on transient JavaScript memory or a save button that only changes a displayed message.

### Save integrity

Implement:

- Multiple save slots.
- Autosaving at safe checkpoints.
- Manual saving where appropriate.
- A versioned save schema.
- Validated loading.
- Safe migration between compatible schema versions.
- Recovery from corrupt or incomplete saves.
- Atomic or transaction-based persistence where possible.
- A backup of the last known valid save.
- A clear error message when recovery fails.
- A safe new-game path that does not accidentally overwrite another slot.

Handle quota errors and unavailable storage gracefully.

### Save testing

Test saving and loading:

- After leveling up.
- After equipping items.
- After completing quests.
- After defeating bosses.
- After unlocking regions.
- After changing settings.
- After refreshing the page.
- After closing and reopening the browser.
- After migrating a supported older save.

Explain that clearing browser site data can erase local saves. Provide an optional export/import feature for portable backups.

### Offline requirements

The core game must run without mandatory network access after its files and assets are available locally.

Add PWA service-worker caching only when the base game works reliably. Cache versioned assets and provide a recovery strategy when a new release updates the asset cache.

Do not require external fonts, CDNs, remote APIs, or online authentication for the core game.

***

# 23. TESTING AND QUALITY ASSURANCE

Create a real automated test suite. Use Vitest for deterministic logic and Playwright for browser behavior.

Do not rely exclusively on visual inspection.

### Unit tests

Test:

- Damage calculations.
- Critical hits.
- Armor and resistances.
- Status-effect application and expiration.
- Cooldowns.
- Resource consumption.
- Equipment statistics.
- Affix generation.
- Loot rarity probabilities.
- Inventory stacking.
- Item selling and dismantling.
- XP thresholds.
- Level progression.
- Skill prerequisites.
- Quest completion.
- Boss phase transitions.
- Save validation.
- Save migrations.
- Invalid and corrupted data.
- Difficulty scaling.

Use deterministic random seeds for tests involving randomness.

### Integration tests

Test:

- Player movement and platform collision.
- Combat interactions between player and enemies.
- Enemy defeat and reward generation.
- Equipment changes affecting actual combat statistics.
- Crafting consuming the correct materials.
- Quest rewards updating progression.
- Scene transitions preserving state.
- Boss victory unlocking the appropriate progression.
- Save/load restoration of a complete gameplay state.

### End-to-end tests

Use Playwright to verify:

1. The game starts in a browser.
2. The main menu is usable.
3. A new character can be created.
4. The player can enter a level.
5. Essential movement controls work.
6. Combat can damage and defeat an enemy.
7. Inventory can be opened.
8. Equipment can be changed.
9. A save survives a page reload.
10. The game can be paused and resumed.
11. Essential UI elements remain accessible at a mobile viewport.
12. The production build loads without critical console errors.

Where gameplay automation is difficult, expose stable test hooks in development builds without adding cheat functionality to normal production gameplay.

### Regression testing

Every bug fix should include a regression test when practical.

Test edge cases such as simultaneous death events, rapid repeated attacks, interrupted scene transitions, storage failures, and duplicate reward claims.

### Accessibility testing

Verify:

- UI scaling.
- Touch target sizes.
- Keyboard navigation in menus.
- Reduced screen shake.
- Reduced flashing.
- Readable text.
- Rarity indicators that do not rely on color alone.
- Clear error messages.
- Safe pause/resume behavior.

***

# 24. PERFORMANCE AND RESOURCE MANAGEMENT

Target smooth gameplay on ordinary Android devices, including budget hardware.

Aim for 60 FPS on capable devices, with stable lower-frame-rate operation where necessary.

Implement:

- Sprite atlases.
- Object pooling for frequent particles and damage indicators.
- Collision optimization.
- Camera-based visibility culling.
- Limits on simultaneous visual effects.
- Adaptive graphics quality.
- Lazy loading for appropriate assets.
- Memory-conscious animation and texture management.
- Efficient enemy updates.
- Safe pause and resume.
- Cleanup of obsolete entities and scene resources.

Avoid:

- Per-frame allocations in hot loops where practical.
- Unbounded particle creation.
- Unnecessary full-scene scans.
- Duplicate event listeners.
- Repeated loading of the same assets.
- Memory leaks from abandoned scenes.
- Uncontrolled timers.
- Excessive battery use.

### Performance diagnostics

Provide a development-only diagnostic mode that reports:

- FPS.
- Frame-time information where practical.
- Active enemy count.
- Active projectile count.
- Particle count.
- Loaded scene information.
- Optional memory measurements where the browser supports them.

Do not display debug overlays in normal release mode unless enabled in settings.

Document the hardware and browser used for performance measurements. Never claim a performance target has been met without evidence.

***

# 25. ACCESSIBILITY AND PLAYER COMFORT

Provide:

- Remappable controls.
- Adjustable UI scale.
- Adjustable text size where practical.
- Reduced screen shake.
- Reduced flashing effects.
- Separate audio controls.
- Color-independent rarity indicators.
- Clear tutorials.
- Pause support.
- Controller support where implemented.
- Adjustable touch-control opacity.
- Confirmation before destructive inventory operations.
- Readable combat telegraphs.

Avoid relying solely on sound or color to communicate critical combat information.

Allow players to disable optional decorative effects without disabling essential gameplay feedback.

***

# 26. BROWSER COMPATIBILITY AND PWA

Make the browser game responsive and usable across supported desktop and mobile browsers.

### Browser behavior

Handle:

- Resize and orientation changes.
- Fullscreen where supported.
- Pointer and keyboard input.
- Touch input.
- Browser focus loss.
- Mobile app suspension.
- Audio initialization restrictions.
- Storage errors.
- Unsupported browser features.

Avoid accidental scrolling and zooming during gameplay while preserving accessible UI interaction.

### Progressive Web App

Once the browser game is stable, add:

- A valid web app manifest.
- Appropriate application icons.
- Installability where supported.
- Versioned offline caching.
- A usable offline startup flow.
- Cache update handling.
- A visible recovery path when an update fails.

A PWA is optional until the core browser game works. Do not allow service-worker caching to conceal failed production builds or serve inconsistent versions of game files.

### Mobile packaging

Document an optional future Capacitor workflow for Android and iOS.

Test native packaging separately before claiming native support. A responsive browser game is not automatically a completed native application.

***

# 27. SECURITY, PRIVACY, AND RELIABILITY

The game must not collect unnecessary personal data.

Requirements:

- No mandatory accounts.
- No hidden telemetry.
- No advertising SDK requirement.
- No external API keys required for core gameplay.
- No secrets committed to GitHub.
- No execution of untrusted save data as code.
- Validation of imported saves.
- Safe handling of malformed local data.
- Dependency updates and vulnerability checks.
- Clear asset-license documentation.

Treat save files and imported data as untrusted input. Enforce reasonable size limits and validate fields, identifiers, numeric values, and schema versions.

The game should continue operating if a nonessential audio asset or decorative resource fails to load.

Fatal initialization failures should produce a clear error screen and useful diagnostic information rather than leaving a blank page.

***

# 28. GITHUB REPOSITORY AND AUTOMATED BUILDS

Prepare a GitHub-ready repository with reproducible development and production workflows.

### Required repository files

- `package.json`.
- `package-lock.json`.
- `tsconfig.json`.
- Vite configuration.
- Vitest configuration.
- Playwright configuration.
- `.gitignore`.
- `.github/workflows/ci.yml`.
- `.github/workflows/deploy-pages.yml`.
- `README.md`.
- `CONTRIBUTING.md`.
- `LICENSE`.
- Asset-license documentation.

Do not commit `node_modules`, generated build output, temporary test artifacts, credentials, or private signing keys.

### Package scripts

Provide equivalent working scripts for:

- `npm run dev`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`
- `npm run build`
- `npm run preview`

Scripts must match the actual dependencies and files in the repository.

Do not add scripts that simply print success without executing the intended operation.

### Continuous integration

Create a GitHub Actions workflow that:

1. Checks out the repository.
2. Installs a supported Node.js version.
3. Uses `npm ci` for reproducible dependency installation.
4. Runs TypeScript type checking.
5. Runs unit tests.
6. Builds the production game.
7. Runs browser tests where the CI environment supports them.
8. Uploads useful test reports or build artifacts when appropriate.
9. Fails the workflow if a required check fails.

Pin GitHub Actions to suitable stable versions and use minimal workflow permissions.

Use dependency caching only when it is reliable and compatible with the lockfile.

### Deployment

Configure an optional GitHub Pages deployment workflow.

Requirements:

- Deploy only from the intended branch or an approved release workflow.
- Set the correct Vite base path for the actual repository deployment location.
- Use a project-pages-compatible asset path.
- Verify nested asset URLs.
- Avoid hardcoded assumptions about a custom domain.
- Keep deployment permissions limited.
- Do not deploy a failed build.
- Confirm the published game loads before declaring deployment successful.

If another hosting provider is selected, document its equivalent configuration rather than mixing deployment systems unnecessarily.

### Releases

Where practical, automate release artifacts after successful validation.

Include:

- A versioned source release.
- A production web build.
- Build metadata.
- Release notes.
- A documented procedure for rollback.

Do not include native APK or iOS artifacts unless a native build workflow has actually been implemented and validated.

***

# 29. DOCUMENTATION AND DEVELOPER EXPERIENCE

Create a useful README containing:

- Game overview.
- Current implementation status.
- Screenshots or genuine gameplay captures when available.
- Supported platforms.
- Prerequisites.
- Installation steps.
- Development commands.
- Test commands.
- Production build instructions.
- GitHub Pages deployment instructions.
- Controls.
- Save system behavior.
- Asset licensing information.
- Known limitations.
- Troubleshooting.
- Roadmap.
- Contribution instructions.

Add documentation explaining how to define new:

- Classes.
- Abilities.
- Enemies.
- Bosses.
- Items.
- Loot affixes.
- Quests.
- Regions.
- Dialogue.
- Localization strings.

Prefer working examples and schemas over lengthy architecture documents that do not match the code.

Maintain an implementation checklist showing which features are complete, partial, planned, or blocked.

***

# 30. BALANCING AND GAME ECONOMY

Keep tunable gameplay parameters in centralized data definitions.

Balance:

- Health and damage.
- Enemy attack frequency.
- Player recovery windows.
- Resource regeneration.
- XP curves.
- Equipment statistics.
- Loot probabilities.
- Crafting costs.
- Merchant prices.
- Upgrade costs.
- Boss phase thresholds.
- Status-effect duration.
- Difficulty modifiers.

Avoid unchecked exponential stat growth.

Create test scenarios for early-, mid-, and late-game combat as the game expands.

Each class should have viable offensive, defensive, and utility choices where consistent with its identity.

Rare items should create interesting decisions rather than simply replacing every previous item with a larger number.

***

# 31. EXPANSION TARGETS AND CONTENT VALIDATION

Full-release goals:

| Content | Target |
|---|---:|
| Playable classes | 12 |
| Enemy variants | 50+ |
| Major bosses | 15+ |
| Major regions | 8 |
| Equipment categories | 8 |
| Equipment rarity tiers | 6 |
| Active/passive abilities per class | 10+ |
| Initial fully playable classes | 6 |

These are content targets, not permission to generate unfinished or duplicate assets.

Every counted enemy variant must have a meaningful difference in behavior, combat role, visual identity, or attack pattern.

Every counted boss must be a playable, functional encounter.

Every counted class must have working abilities, progression, and class-specific behavior.

Every counted region must contain playable terrain, valid transitions, meaningful encounters, and its intended progression.

Track content through validated data registries and automated checks.

Reject missing assets, duplicate IDs, invalid references, nonexistent abilities, and malformed level definitions during development.

***

# 32. FINAL ACCEPTANCE CRITERIA

The vertical slice is ready for review only when all critical requirements below are met.

## Gameplay

- [ ] The game starts and reaches the playable level.
- [ ] Character creation and selection work.
- [ ] Movement, jumping, and collision work.
- [ ] Combat hit detection works.
- [ ] Abilities and cooldowns work.
- [ ] Enemies use functional AI.
- [ ] The elite encounter is playable.
- [ ] The boss has working phases and attack patterns.
- [ ] XP and leveling work.
- [ ] Loot drops and can be collected.
- [ ] Inventory and equipment affect gameplay.
- [ ] The checkpoint works.
- [ ] Victory and defeat states work.

## Persistence

- [ ] Save data is genuinely persisted.
- [ ] Reloading restores the expected game state.
- [ ] Multiple slots are isolated.
- [ ] Invalid saves are handled safely.
- [ ] Critical progression does not reset unexpectedly.

## Controls and UI

- [ ] Keyboard controls work.
- [ ] Mobile touch controls work.
- [ ] Menus and HUD display real game state.
- [ ] Pause and resume work.
- [ ] Settings persist.
- [ ] The layout adapts to mobile viewports.

## Technical quality

- [ ] TypeScript type checking passes.
- [ ] Unit tests pass.
- [ ] Critical integration tests pass.
- [ ] Browser smoke tests pass.
- [ ] Production build completes.
- [ ] No known critical runtime errors remain.
- [ ] Scene cleanup is verified.
- [ ] Offline operation is verified after initial asset availability.
- [ ] Repository documentation matches the implementation.

## CI and delivery

- [ ] A clean checkout can install dependencies.
- [ ] CI runs the required checks.
- [ ] A failing test causes CI to fail.
- [ ] Production assets use correct deployment paths.
- [ ] The deployment workflow is configured and validated where access permits.
- [ ] No credentials or secrets are committed.

A release candidate must not be declared complete when any critical acceptance criterion remains unverified.

***

# 33. REQUIRED FINAL DELIVERY

Deliver a GitHub-ready source repository containing the actual playable game.

The project must include:

1. Complete source code for implemented systems.
2. Original or properly licensed assets.
3. Reproducible dependency installation.
4. Development and production commands.
5. Automated unit tests.
6. Browser smoke tests.
7. GitHub Actions CI workflow.
8. Optional validated GitHub Pages deployment.
9. Documentation and asset-license records.
10. A clearly prioritized roadmap for the next milestone.

Report:

- What was implemented.
- What was tested.
- Which commands were executed.
- Which tests passed or failed.
- Whether the production build succeeded.
- Whether deployment was actually verified.
- Which features remain incomplete.
- Any important browser, device, or performance limitations.

Do not claim to have uploaded, deployed, tested, or published anything unless that operation actually succeeded.

If GitHub access or deployment permissions are unavailable, provide the repository-ready files and precise setup instructions rather than pretending the project was uploaded.

***

# 34. EXECUTION INSTRUCTIONS

Begin by inspecting the existing repository, if one is provided.

Identify the current application structure, dependencies, available assets, existing workflows, and any established project conventions. Preserve useful existing work and avoid unnecessary rewrites.

Then proceed in this order:

**Step 1:** Establish the Phaser 3, TypeScript, and Vite foundation.

**Step 2:** Create the boot, preload, title, and world scenes.

**Step 3:** Implement the Vanguard character controller and reliable platform collision.

**Step 4:** Implement the combat simulation, attack hitboxes, damage calculations, and cooldowns.

**Step 5:** Add three functional enemy archetypes and their AI state machines.

**Step 6:** Build the first handcrafted Ashen Frontier level and its boss arena.

**Step 7:** Implement XP, equipment drops, inventory, and character progression.

**Step 8:** Implement IndexedDB persistence, save slots, validation, and recovery.

**Step 9:** Add responsive mobile controls, desktop input, menus, and settings.

**Step 10:** Add original visual effects, animations, and audio.

**Step 11:** Write and execute automated tests.

**Step 12:** Configure GitHub Actions, validate the production build, and prepare deployment.

**Step 13:** Review every vertical-slice acceptance criterion and fix failures.

**Step 14:** Expand the content using the established data-driven architecture.

After each major step, run the relevant checks and keep the project in a working state.

Do not attempt to generate the entire commercial-scale game in one enormous file. Build a coherent, maintainable project in incremental, testable milestones.

## THE FINAL DIRECTIVE

Build SHADOWFALL: REALMS OF CHAOS as a real game that players can launch, control, explore, fight through, progress in, save, and return to.

Prioritize a small amount of excellent, functional gameplay over a large quantity of unfinished features.

**First deliver the playable vertical slice. Then build the world worthy of it.**