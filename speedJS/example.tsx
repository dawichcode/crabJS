/** @jsx jsx */
import { Component, Context, ErrorBoundary, ErrorInfo, jsx, VNode } from './vdom';
import { FunctionalComponent } from './vdom/FunctionalComponent';
import { useState,useCallback} from './vdom/hooks';
import { speed$ } from './index';
import { SyntheticEvent } from './vdom/events/SyntheticEvent';

// Action types for reducer
type CounterAction = 
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' };

// Reducer function
function counterReducer(state: number, action: CounterAction): number {
  switch (action.type) {
    case 'increment':
      return state + 1;
    case 'decrement':
      return state - 1;
    case 'reset':
      return 0;
    default:
      return state;
  }
}

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

class TodoList extends FunctionalComponent {
  renderFunction(): VNode {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [input, setInput] = useState('');

    const addTodo = useCallback(() => {
      if (input.trim()) {
        setTodos(prev => [...prev, {
          id: Date.now(),
          text: input.trim(),
          completed: false
        }]);
        setInput('');
      }
    }, [input]);

    const toggleTodo = useCallback((id: number) => {
      setTodos(prev => prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    }, []);

    const removeTodo = useCallback((id: number) => {
      setTodos(prev => prev.filter(todo => todo.id !== id));
    }, []);

    return (
      <div>
        <div>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Add todo"
          />
          <button onClick={addTodo}>Add</button>
        </div>
        <ul>
          {todos.map(todo => (
            <li key={todo.id}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span style={{ 
                textDecoration: todo.completed ? 'line-through' : 'none' 
              }}>
                {todo.text}
              </span>
              <button onClick={() => removeTodo(todo.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

// Buggy component that will throw an error
class BuggyCounter extends Component<{}, { count: number }> {
  constructor(props: {}) {
    super(props);
    this.state = { count: 0 };
  }

  render(): VNode {
    if (this.state.count === 5) {
      throw new Error('I crashed!');
    }
    return (
      <div>
        <h1>{this.state.count}</h1>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Add
        </button>
      </div>
    );
  }
}

// Error boundary component
class ErrorBoundaryExample extends ErrorBoundary {
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.log('Error caught:', error);
    console.log('Error info:', errorInfo);
  }

  protected fallbackRender(error: Error): VNode {
    return (
      <div>
        <h2>Something went wrong.</h2>
        <details style={{ whiteSpace: 'pre-wrap' }}>
          {error.toString()}
        </details>
      </div>
    );
  }
}

// Create a theme context
const ThemeContext = Context.createContext({
  foreground: '#000000',
  background: '#ffffff'
});

// Create a theme toggler component
class ThemeToggler extends Component<{}, { darkMode: boolean }> {
  constructor(props: {}) {
    super(props);
    this.state = { darkMode: false };
  }

  toggleTheme = (): void => {
    this.setState({ darkMode: !this.state.darkMode });
  }

  render(): VNode {
    const theme = {
      foreground: this.state.darkMode ? '#ffffff' : '#000000',
      background: this.state.darkMode ? '#222222' : '#ffffff'
    };

    return (
      <ThemeContext.Provider value={theme}>
        <div>
          <button onClick={this.toggleTheme}>
            Toggle Theme
          </button>
          <ThemedButton />
        </div>
      </ThemeContext.Provider>
    );
  }
}

// Create a themed button component
class ThemedButton extends Component {
  render(): VNode {
    return (
      <ThemeContext.Consumer>
        {theme => (
          <button
            style={{
              color: theme.foreground,
              backgroundColor: theme.background
            }}
          >
            I am styled by theme context!
          </button>
        )}
      </ThemeContext.Consumer>
    );
  }
}

class BatchUpdateDemo extends FunctionalComponent {
  renderFunction(): VNode {
    const [count1, setCount1] = useState(0);
    const [count2, setCount2] = useState(0);
    const [total, setTotal] = useState(0);

    console.log('Render:', { count1, count2, total });

    const updateAll = useCallback(() => {
      // These will be batched into a single update
      setCount1(c => c + 1);
      setCount2(c => c + 1);
      setTotal(t => t + 2);
    }, []);

    return (
      <div>
        <h2>Batch Update Demo</h2>
        <p>Count 1: {count1}</p>
        <p>Count 2: {count2}</p>
        <p>Total: {total}</p>
        <button onClick={updateAll}>Update All</button>
      </div>
    );
  }
}

class EventDemo extends FunctionalComponent {
  renderFunction(): VNode {
    const handleClick = useCallback((e: SyntheticEvent) => {
      e.preventDefault();
      console.log('Synthetic Event:', {
        type: e.type,
        target: e.target,
        currentTarget: e.currentTarget,
        nativeEvent: e.nativeEvent
      });
    }, []);

    const handleParentClick = useCallback((e: SyntheticEvent) => {
      console.log('Parent clicked');
      // Stop event propagation
      e.stopPropagation();
    }, []);

    return (
      <div onClick={handleParentClick} style={{ padding: '20px', background: '#f0f0f0' }}>
        <h2>Event Demo</h2>
        <button 
          onClick={handleClick}
          onMouseEnter={e => console.log('Mouse entered')}
          onMouseLeave={e => console.log('Mouse left')}
        >
          Click me
        </button>
      </div>
    );
  }
}

// Initialize app when loaded
function initApp() {
  speed$.mount(new EventDemo({}), '#app');
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
} 