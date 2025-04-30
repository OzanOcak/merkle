import { createHashRouter, RouterProvider } from 'react-router-dom'
import MainLayout from './components/mainlayout'
import InfoPage from './pages/infopage'
import InfoPage2 from './pages/infopage2'
import './App.css'
import MdEditor from './components/mdEditor'

const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout />, // Use MainLayout for tracking and error handling
    children: [
      {
        index: true, // This makes TodoList the default route
        element: <MdEditor /> // Page displaying the list of todos
      },
      {
        path: 'todos/:id', // Dynamic route for individual todo items
        element: <InfoPage2 /> // Page displaying a single todo item
      },
      {
        path: 'info',
        element: <InfoPage /> // Additional info page
      }
    ]
  }
])

const App: React.FC = () => {
  return <RouterProvider router={router} />
}

export default App
