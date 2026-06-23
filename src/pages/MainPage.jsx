import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks } from '../api/books';
import { BASE_URL } from '../api/config';

function MainPage() {
  const [aiIntros, setAiIntros] = useState({});
  const [books, setBooks] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 1. 책 데이터 fetch
  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await getBooks();
        if (!res.ok) throw new Error('도서 데이터를 불러오지 못했습니다.');
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

  const totalReviews = books.reduce((sum, b) => sum + (b.reviewCount || 0), 0);
  const C = books.length > 0 ? totalReviews / books.length : 1;
  const totalRatingSum = books.reduce(
    (sum, b) => sum + (b.avg_rating || 0) * (b.reviewCount || 0), 0
  );
  const m = totalReviews > 0 ? totalRatingSum / totalReviews : 0;

  const trendingBooks = [...books]
    .sort((a, b) => {
      const nA = a.reviewCount || 0;
      const nB = b.reviewCount || 0;
      const scoreA = (C * m + (a.avg_rating || 0) * nA) / (C + nA);
      const scoreB = (C * m + (b.avg_rating || 0) * nB) / (C + nB);
      return scoreB - scoreA;
    })
    .slice(0, 3);

  const recommendedBook = trendingBooks[0];

  const recentBooks = [...books]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // 2. trendingBooks, recentBooks 선언 후 AI 호출
  useEffect(() => {
    if (trendingBooks.length === 0) return;

    const booksToIntro = [trendingBooks[0], trendingBooks[1], recentBooks[0]].filter(Boolean);

    booksToIntro.forEach(async (book) => {
      if (!book || aiIntros[book.id]) return;

      try {
        const res = await fetch(`${BASE_URL}/books/ai-intro`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: book.id, title: book.title, author: book.author }),
        });
        const data = await res.json();
        const intro = data.choices?.[0]?.message?.content ?? '✨ AI 소개를 불러오지 못했습니다.';
        setAiIntros((prev) => ({ ...prev, [book.id]: intro }));
      } catch (e) {
        console.error('AI 소개 호출 실패', e);
        setAiIntros((prev) => ({ ...prev, [book.id]: '✨ AI 소개 호출 실패' }));
      }
    });
  }, [trendingBooks.length, recentBooks.length]);

  const bannerSlides = [
    {
      type: 'single',
      label: '5월의 추천 도서',
      title: recommendedBook?.title,
      author: recommendedBook?.author,
      book: recommendedBook,
    },
    {
      type: 'single',
      label: '화제작 Best 1',
      title: trendingBooks[1]?.title,
      author: trendingBooks[1]?.author,
      book: trendingBooks[1],
    },
    {
      type: 'single',
      label: 'NEW UPDATE',
      title: recentBooks[0]?.title,
      author: recentBooks[0]?.author,
      book: recentBooks[0],
    },
  ].filter((slide) => slide.type === 'single' ? slide.book : slide.books.length > 0);

  const currentSlide = bannerSlides[slideIndex];

  const handlePrevSlide = () => {
    setSlideIndex((prev) => prev === 0 ? bannerSlides.length - 1 : prev - 1);
  };

  const handleNextSlide = () => {
    setSlideIndex((prev) => prev === bannerSlides.length - 1 ? 0 : prev + 1);
  };

  if (loading) {
    return <p className="empty">불러오는 중...</p>;
  }

  if (error) {
    return (
      <p className="empty" style={{ color: '#e74c3c' }}>
        {error}
      </p>
    );
  }

  return (
    <div>
      {currentSlide && (
        <section
          style={{
            position: 'relative',
            minHeight: 290,
            borderRadius: 22,
            marginBottom: 56,
            padding: '48px 72px',
            background:
              'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
            overflow: 'hidden',
            cursor: 'pointer',
            boxShadow: 'var(--glass-shadow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onClick={() => {
            if (currentSlide.type === 'single') {
              navigate(`/books/${currentSlide.book.id}`);
            }
          }}
              >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevSlide();
            }}
            style={{
              position: 'absolute',
              left: 18,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.9)',
              fontSize: 28,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            }}
          >
            ‹
          </button>

          <div
            style={{
              textAlign: 'left',
              color: 'white',
              zIndex: 1,
              
            }}
          >
            <p
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                marginBottom: 16,
                opacity: 0.9,
              }}
            >
              {currentSlide.label}
            </p>

            {/* 한줄 소개만 크게 */}
            <p
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                lineHeight: 1.4,
                maxWidth: 460,
                marginBottom: 0,
              }}
            >
              {aiIntros[currentSlide.book?.id]
                ? aiIntros[currentSlide.book.id]
                : '✨ AI 소개 생성 중...'}
            </p>
          </div>

          <div
            style={{
              width: 190,
              aspectRatio: '2 / 3',
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 14px 34px rgba(0,0,0,0.28)',
              background: 'rgba(255,255,255,0.2)',
              marginRight: 70,
              flexShrink: 0,
            }}
          >
            {currentSlide.book.coverImageUrl ? (
              <img
                src={currentSlide.book.coverImageUrl}
                alt={currentSlide.book.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  fontSize: '4rem',
                }}
              >
                📖
              </div>
            )}
          </div>

          <div
            style={{
              position: 'absolute',
              right: 74,
              bottom: 28,
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.22)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            {slideIndex + 1} / {bannerSlides.length}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextSlide();
            }}
            style={{
              position: 'absolute',
              right: 18,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.9)',
              fontSize: 28,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            }}
          >
            ›
          </button>
        </section>
      )}


      {/* 화제작 섹션 */}
      <h3
        style={{
          marginTop: 55,
          textAlign: 'left',
          fontSize: 28,
        }}
      >
        🔥 화제작 Best 3
      </h3>

      <div
        className="book-grid"
        style={{
          gridTemplateColumns: 'repeat(3, 1fr)',
          marginBottom: 36,
        }}
      >
        {trendingBooks.map((book) => (
          <div
            key={book.id}
            className="book-card"
            onClick={() => navigate(`/books/${book.id}`)}
            style={{ overflow: 'hidden' }}
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
                  fontSize: '3rem',
                }}
              >
                📖
              </div>
            )}

            <div className="book-card-body">
              <h3>{book.title}</h3>
              <p>{book.author}</p>

              <p style={{ fontSize: '0.8rem', color: '#f5a623' }}>
                ⭐ {book.avg_rating > 0 ? book.avg_rating.toFixed(1) : '0.0'}
                {' · '}
                리뷰 {book.reviewCount || 0}개
              </p>
            </div>
          </div>
        ))}
      </div>


      {/* 신규 업데이트 섹션 */}
      <h3
        style={{
          marginTop: 55,
          textAlign: 'left',
          fontSize: 28,
        }}
      >
        🆕 신규 업데이트
      </h3>

      <div
        className="book-grid"
        style={{
          gridTemplateColumns: 'repeat(5, 1fr)',
        }}
      >
        {recentBooks.map((book) => (
          <div
            key={book.id}
            className="book-card"
            onClick={() => navigate(`/books/${book.id}`)}
            style={{ overflow: 'hidden' }}
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
                  fontSize: '3rem',
                }}
              >
                📖
              </div>
            )}

            <div className="book-card-body">
              <h3 style={{ fontSize: '0.9rem' }}>{book.title}</h3>

              <p style={{ fontSize: '0.8rem' }}>{book.author}</p>

              <p
                style={{
                  fontSize: '0.7rem',
                  color: '#bbb',
                  marginTop: 4,
                }}
              >
                {book.createdAt
                  ? new Date(book.updatedAt).toLocaleDateString('ko-KR')
                  : '날짜 없음'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MainPage;