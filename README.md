![react-typewrite](https://raw.githubusercontent.com/oliverox/react-typewrite/master/public/logo.png)<br/>
-----
A customizable typewriter component built with React.<br/>**3KB gziped** (including styling).

### Features
- Supports infinitely nested elements.
- Allows custom typing and erasing speeds.
- Cycles easily through a list of elements.
- Gives full control on styling with CSS.
- Allows custom cursor.

### Demo

--_GIF image demo here_--

### Installation

```bash
npm install react-typewrite
```

### Usage
```javascript
import Typewrite from 'react-typewrite';

<Typewrite>The earth is but one country, and mankind its citizens.</Typewrite>
```

### API
| Props | Type| Description |
| --- | --- | --- |
| className | String | Applies a class style to the element. |
| cycle | Boolean | Cycle through a list of child elements.<br/>Default: `false`. |
| cycleType | String | `erase`: erases previous element before typing the next element.<br/>`reset`: resets cursor to start position before typing the next element.<br/>Default: `erase`. |
| defaultElement | String or Element | The default element to start cycling animation with.<br/>Default: `''`. |
| eraseDelay | Number| Delay (in ms) before starting to erase characters when cycling.<br/>Default: `2000`. |
| onTypingDone | Function | Callback when typing animation is over. |
| pause | Boolean | Controls the start of typing animation.<br/>Default: `false`. |
| startTypingDelay | Number | Delay (in ms) before start of typing.<br/>Default: `0`. |
| typingDelay | Number | Delay (in ms) before each character typed.<br/>Default: `30`. |
| hideCursorDelay | Number | Delay (in ms) before hiding the cursor at the end of the typing animation. A negative value will prevent the cursor from hiding.<br/>Default: `-1`. |
| cursorColor | String | The color of the cursor.<br/>Default: `#000`. |
| cursorWidth | Number | The width of the cursor in px.<br/>Default: `2`. |

