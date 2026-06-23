import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import MainPage from './pages/MainPage';
import BookListPage from './pages/BookListPage';
import BookDetailPage from './pages/BookDetailPage';
import BookFormPage from './pages/BookFormPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/books" element={<BookListPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/books/new" element={<BookFormPage />} />
          <Route path="/books/:id/edit" element={<BookFormPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;