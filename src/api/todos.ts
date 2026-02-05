import { Todo } from '../types/Todo';
import { client } from '../utils/fetchClient';

export const USER_ID = 3943;

export const getTodos = () => {
  return client.get<Todo[]>(`/todos?userId=${USER_ID}`);
};

// Add more methods here/Каждый todo — это объект примерно такого вида:
// {
//   "id": 1,
//   "userId": USER_ID,
//   "title": "Buy milk",
//   "completed": false
// }

export const createTodo = ({
  title,
  userId = USER_ID,
  completed = false,
}: Omit<Todo, 'id'>) => {
  return client.post<Todo>(`/todos`, { userId, title, completed });
};

export const deleteTodo = (todoId: number) => {
  return client.delete(`/todos/${todoId}`);
};

export const updateTodo = (id: number, data: Partial<Todo>) => {
  return client.patch<Todo>(`/todos/${id}`, data);
};
