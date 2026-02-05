/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useRef, useEffect } from 'react';
import { Todo } from './types/Todo';
import { UserWarning } from './UserWarning';
import {
  createTodo,
  getTodos,
  deleteTodo,
  updateTodo,
  USER_ID,
} from './api/todos';

type Filter = 'all' | 'active' | 'completed';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [error, setError] = useState('');
  const [loadingIds, setLoadingIds] = useState<number[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 3000);
  };

  const hideError = () => setError('');

  // Загрузка задачи с сервера
  useEffect(() => {
    hideError();
    getTodos()
      .then(setTodos)
      .catch(() => showError('Unable to load todos'));
  }, []);

  // добавим Todo
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hideError();

    const trimmed = title.trim();

    if (!trimmed) {
      showError('Title should not be empty');

      return;
    }

    createTodo({ title: trimmed })
      .then(todo => {
        setTodos(prev => [...prev, todo]);
        setTitle('');
        inputRef.current?.focus();
      })
      .catch(() => showError('Unable to add a todo'));
  };

  // уд.TODO
  const handleDelete = (id: number) => {
    hideError();
    setLoadingIds(prev => [...prev, id]);

    deleteTodo(id)
      .then(() => {
        setTodos(prev => prev.filter(todo => todo.id !== id));
      })
      .catch(() => showError('Unable to delete a todo'))
      .finally(() => {
        setLoadingIds(prev => prev.filter(tid => tid !== id));
      });
  };

  // перекл. COMPLETED
  const toggleTodo = (todo: Todo) => {
    hideError();
    setLoadingIds(prev => [...prev, todo.id]);

    updateTodo(todo.id, { completed: !todo.completed })
      .then(updated => {
        setTodos(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      })
      .catch(() => showError('Unable to update a todo'))
      .finally(() => {
        setLoadingIds(prev => prev.filter(id => id !== todo.id));
      });
  };

  // фильтр
  const visibleTodos = todos.filter(todo => {
    if (filter === 'active') {
      return !todo.completed;
    }

    if (filter === 'completed') {
      return todo.completed;
    }

    return true;
  });

  const hasTodos = todos.length > 0;

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              data-cy="NewTodoField"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
            />
          </form>
        </header>

        {hasTodos && (
          <section className="todoapp__main" data-cy="TodoList">
            {visibleTodos.map(todo => {
              const isLoading = loadingIds.includes(todo.id);

              return (
                <div
                  key={todo.id}
                  data-cy="Todo"
                  className={`todo ${todo.completed ? 'completed' : ''}`}
                >
                  <label className="todo__status-label">
                    <input
                      type="checkbox"
                      className="todo__status"
                      checked={todo.completed}
                      disabled={isLoading}
                      onChange={() => toggleTodo(todo)}
                    />
                  </label>

                  <span data-cy="TodoTitle" className="todo__title">
                    {todo.title}
                  </span>

                  <button
                    type="button"
                    className="todo__remove"
                    data-cy="TodoDelete"
                    disabled={isLoading}
                    onClick={() => handleDelete(todo.id)}
                  >
                    ×
                  </button>

                  {isLoading && (
                    <div
                      data-cy="TodoLoader"
                      className="modal overlay is-active"
                    >
                      <div
                        className="modal-background
                        has-background-white-ter"
                      />
                      <div className="loader" />
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {hasTodos && (
          <footer className="todoapp__footer" data-cy="Footer">
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={`filter__link ${filter === 'all' ? 'selected' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </a>
              <a
                href="#/active"
                className={`filter__link ${
                  filter === 'active' ? 'selected' : ''
                }`}
                onClick={() => setFilter('active')}
              >
                Active
              </a>
              <a
                href="#/completed"
                className={`filter__link ${
                  filter === 'completed' ? 'selected' : ''
                }`}
                onClick={() => setFilter('completed')}
              >
                Completed
              </a>
            </nav>
          </footer>
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light ${error ? '' : 'hidden'}`}
      >
        <button
          data-cy="HideErrorButton"
          className="delete"
          onClick={hideError}
        />
        {error}
      </div>
    </div>
  );
};
