import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks } from '../api/books';

const CATEGORIES = [
  '전체',
  '000 총류',
  '100 철학',
  '200 종교',
  '300 사회과학',
  '400 자연과학',
  '500 기술과학',
  '600 예술',
  '700 언어',
  '800 문학',
];

function BookListPage() {
  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [sortType, setSortType] = useState('review');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await getBooks();
        if (!res.ok) throw new Error('데이터를 불러오지 못했습니다.');
        const data = await res.json();
        setBooks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  const searched = books.filter((b) => {
  if (!searchQuery.trim()) return true;
  // 검색어 공백 제거
  const q = searchQuery
    .trim()
    .toLowerCase()
    .replace(/\s/g, '');
  // 제목 공백 제거
  const title = (b.title || '')
    .toLowerCase()
    .replace(/\s/g, '');
  // 저자 공백 제거
  const author = (b.author || '')
    .toLowerCase()
    .replace(/\s/g, '');
  if (searchType === 'title') {
    return title.includes(q);
  }
  if (searchType === 'author') {
    return author.includes(q);
  }
  return true;
});

  const filtered =
    selectedCategory === '전체'
      ? searched
      : searched.filter((b) => b.category === selectedCategory);

  const sortedBooks = [...filtered].sort((a, b) => {
    if (sortType === 'review') {
      // 평점 우선
      const ratingDiff =
        (b.avg_rating || 0) - (a.avg_rating || 0);

      // 평점 같으면 리뷰 수로 정렬
      if (ratingDiff !== 0) {
        return ratingDiff;
      }

      return (
        (b.reviewCount || 0) -
        (a.reviewCount || 0)
      );
    }

    if (sortType === 'date') {
      return (
        new Date(b.createdAt) -
        new Date(a.createdAt)
      );
    }

    return 0;
  });

  if (loading) return <p className="empty">불러오는 중...</p>;
  if (error) return <p className="empty" style={{ color: '#e74c3c' }}>{error}</p>;

  return (
    <div>
      <h2 className="page-title">도서 목록</h2>

      {/* 검색 바 */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          padding: '12px 16px',
          borderRadius: 20,
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(10px)',
          border: '1px dashed rgba(118,75,162,0.4)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 12,
            border: '1px solid rgba(118,75,162,0.3)',
            background: 'rgba(255,255,255,0.8)',
            color: '#2d3748',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <option value="title">제목</option>
          <option value="author">저자</option>
        </select>
        <input
          type="text"
          placeholder={
            searchType === 'title'
              ? '제목으로 검색...'
              : searchType === 'author'
              ? '저자로 검색...'
              : '카테고리로 검색...'
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 16px',
            borderRadius: 12,
            border: '1px solid rgba(118,75,162,0.3)',
            background: 'rgba(255,255,255,0.8)',
            color: 'var(--text-main)',
            fontSize: '0.95rem',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              padding: '8px 14px',
              borderRadius: 12,
              border: 'none',
              background: 'rgba(200,200,200,0.5)',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#555',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* 카테고리 필터 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 20px',
              borderRadius: 30,
              border: '1px solid rgba(255,255,255,0.8)',
              cursor: 'pointer',
              background:
                selectedCategory === cat
                  ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))'
                  : 'rgba(255,255,255,0.6)',
              color: selectedCategory === cat ? 'white' : 'var(--text-main)',
              fontWeight: selectedCategory === cat ? 600 : 500,
              boxShadow:
                selectedCategory === cat
                  ? '0 4px 10px rgba(102, 126, 234, 0.4)'
                  : '0 2px 5px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 정렬 버튼 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(10px)',
            border: '1px dashed rgba(118,75,162,0.4)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <span
            style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#555',
            }}
          >
            정렬 기준
          </span>

          <button
            onClick={() => setSortType('review')}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              background:
                sortType === 'review'
                  ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))'
                  : 'rgba(255,255,255,0.7)',
              color: sortType === 'review' ? '#fff' : '#555',
              boxShadow:
                sortType === 'review'
                  ? '0 4px 12px rgba(102,126,234,0.4)'
                  : 'none',
            }}
          >
            ⭐ 리뷰순
          </button>

          <button
            onClick={() => setSortType('date')}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              background:
                sortType === 'date'
                  ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))'
                  : 'rgba(255,255,255,0.7)',
              color: sortType === 'date' ? '#fff' : '#555',
              boxShadow:
                sortType === 'date'
                  ? '0 4px 12px rgba(102,126,234,0.4)'
                  : 'none',
            }}
          >
            📅 최신순
          </button>
        </div>
      </div>

      {sortedBooks.length === 0 ? (
        <p className="empty">해당 카테고리의 도서가 없습니다.</p>
      ) : (
        <div className="book-grid">
          {sortedBooks.map((book) => (
            <div
              key={book.id}
              className="book-card"
              onClick={() => navigate(`/books/${book.id}`)}
              style={{
                overflow: 'hidden',
              }}
            >
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  style={{
                    width: '100%',
                    aspectRatio: '2 / 3',
                    objectFit: 'cover',
                    borderRadius: '16px 16px 0 0',
                    display: 'block',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '2 / 3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                  }}
                >
                  📖
                </div>
              )}

              <div className="book-card-body">
                <h3>{book.title}</h3>
                <p>{book.author}</p>

                <p style={{ fontSize: '0.8rem', color: '#f5a623' }}>
                  {'⭐'.repeat(Math.round(book.avg_rating || 0))}{' '}
                  {book.avg_rating > 0 ? book.avg_rating.toFixed(1) : ''}
                </p>

                <p style={{ fontSize: '0.75rem', color: '#bbb', marginTop: 4 }}>
                  {new Date(book.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookListPage;