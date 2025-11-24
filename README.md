
# Super Mario Phaser

Super Mario Phaser is a recreation of the classic Super Mario Bros game using the Phaser 3 framework. This project is designed for "Edutainment"—it's meant to be easily modded and understood by developers new to game development. One of its key features is procedural level generation, which ensures that each playthrough offers a unique experience.

## Table of Contents
- [Demo](#demo)
- [Development Setup](#development-setup)
- [Controls](#controls)
- [Development & Testing Tools](#development--testing-tools)
- [Contributing](#contributing)
- [License](#license)

## Demo

A live demo of the game can be accessed at [https://decapapi.github.io/Super-Mario-Phaser/](https://decapapi.github.io/Super-Mario-Phaser/).

Some screenshots of the game:

![Level Gameplay](assets/showcase/level-gameplay.gif)
![Level Start](assets/showcase/level-start.gif)

## Development Setup

This project uses [Vite](https://vitejs.dev/) as a local development server, which provides a fast hot-reload workflow.

1.  **Install Dependencies:**
    Open your terminal in the project root and run:
    ```bash
    npm install
    ```

2.  **Start the Development Server:**
    Once the dependencies are installed, run:
    ```bash
    npm start
    ```

3.  **Open in Browser:**
    Vite will start the server and provide a local URL, typically `http://localhost:5173`. Open this URL in your browser to play the game. Any changes you save to the `.js` files will now automatically reload in the browser.

## Controls

Controls are fully customizable, however default controls are:

| Action      | Key         |
| ----------- | ----------- |
| **Jump**    | `SPACE`     |
| **Move Left** | `A`         |
| **Move Right**| `D`         |
| **Crouch**  | `S`         |
| **Fire**    | `Q`         |

## Development & Testing Tools

This project includes several features to make testing and modification easier for both humans and AI agents.

### Deterministic Level Generation
You can force the level generator to produce the same level every time by providing a seed in the URL. This is essential for reproducible testing.
- **Example:** `http://localhost:5173/?seed=12345`

    console.groupCollapsed('SMOKE: move-right');
    console.log('before x', player.x);
    AgentHelpers.pressKey({ code: 'ArrowRight', durationMs: 250 });
    setTimeout(() => {
      console.log('after x', player.x);
      console.groupEnd();
    }, 300);
    ```

-   **Test a Jump:**
    ```js
    console.groupCollapsed('SMOKE: jump');
    console.log('before vy', player.body.velocity.y);
    AgentHelpers.pressKey({ code: 'Space', durationMs: 100 });
    setTimeout(() => {
      console.log('after vy', player.body.velocity.y);
      console.groupEnd();
    }, 150);
    ```

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request. Make sure to adhere to the existing code style and follow the established guidelines.
