import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBook, getBooks, getRelatedBooks, updateBook, deleteBook } from '../api/books';
import { getReviews, createReview, deleteReview } from '../api/reviews';

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 리뷰 작성 폼 상태
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [reviewError, setReviewError] = useState('');

  // 리뷰 삭제 인라인 상태
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');

  // 리뷰 정렬
  const [reviewSort, setReviewSort] = useState('latest');

  useEffect(() => {
    async function fetchData() {
      try {
        const [bookRes, reviewRes, allBooksRes, relatedRes] = await Promise.all([
          getBook(id),
          getReviews(id),
          getBooks(),
          getRelatedBooks(id),
        ]);
        if (!bookRes.ok) throw new Error('도서를 찾을 수 없습니다.');
        setBook(await bookRes.json());
        setReviews(await reviewRes.json());
        setAllBooks(await allBooksRes.json());
        setRelatedBooks(await relatedRes.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // rate_point 재계산 후 books에 PATCH
  const updateRatePoint = async (updatedReviews) => {
    if (updatedReviews.length === 0) {
      await updateBook(id, { avg_rating: 0, rate_point: 0, reviewCount: 0 });
      setBook((prev) => ({ ...prev, avg_rating: 0, rate_point: 0, reviewCount: 0 }));
      return;
    }

    const ratingSum = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Math.round((ratingSum / updatedReviews.length) * 10) / 10;

    const C = 5;
    const booksWithRatings = allBooks.filter((b) => b.avg_rating > 0);
    const m = booksWithRatings.length > 0
      ? booksWithRatings.reduce((sum, b) => sum + b.avg_rating, 0) / booksWithRatings.length
      : 3.5;
    const bayesian = Math.round(((C * m + ratingSum) / (C + updatedReviews.length)) * 10) / 10;

    await updateBook(id, { avg_rating: avgRating, rate_point: bayesian, reviewCount: updatedReviews.length });
    setBook((prev) => ({ ...prev, avg_rating: avgRating, rate_point: bayesian, reviewCount: updatedReviews.length }));
  };

  const handleDelete = async () => {
    if (!window.confirm(`"${book.title}"을(를) 삭제하시겠습니까?`)) return;
    try {
      const res = await deleteBook(id);
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReviewSubmit = async () => {
    if (!nickname.trim()) { setReviewError('닉네임을 입력해주세요.'); return; }
    if (!password.trim()) { setReviewError('비밀번호를 입력해주세요.'); return; }
    if (!content.trim())  { setReviewError('내용을 입력해주세요.'); return; }
    setReviewError('');

    try {
      const res = await createReview({
        bookId: Number(id),
        nickname,
        password,
        rating,
        content,
        createdAt: new Date().toISOString(),
      });
      if (!res.ok) throw new Error('리뷰 등록에 실패했습니다.');
      const newReview = await res.json();
      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);
      await updateRatePoint(updatedReviews);
      setNickname(''); setPassword(''); setRating(5); setContent('');
    } catch (err) {
      setReviewError(err.message);
    }
  };

  const handleReviewDelete = async (reviewId) => {
    try { //DB로 변경하면서 생기는 오류 처리 => GET으로 처리
      const res = await deleteReview(reviewId, deletePassword);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || '삭제에 실패했습니다. 비밀번호를 확인해주세요.');
      }
      const updatedReviews = reviews.filter((r) => r.id !== reviewId);
      setReviews(updatedReviews);
      await updateRatePoint(updatedReviews);
      setDeletingReviewId(null);
      setDeletePassword('');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p className="empty">불러오는 중...</p>;
  if (error) return (
    <div className="empty">
      <p style={{ color: '#e74c3c' }}>{error}</p>
      <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>목록으로</button>
    </div>
  );

  return (
    <div>
      <div className="book-detail">
        <div className="book-detail-cover">
          {book.coverImageUrl ? <img src={book.coverImageUrl} alt={book.title} /> : '📖'}
        </div>

        <h2>{book.title}</h2>
        <p className="author">저자: {book.author} · 장르: {book.category}</p>
        <p style={{ color: '#f5a623', marginBottom: 8 }}>
          ⭐ {book.avg_rating > 0 ? book.avg_rating.toFixed(1) : '평점 없음'} ({reviews.length}개 리뷰)
        </p>
        <p className="content">{book.content}</p>
        <p className="dates">
          등록일: {new Date(book.createdAt).toLocaleDateString('ko-KR')}
          &nbsp;·&nbsp;
          수정일: {new Date(book.updatedAt).toLocaleDateString('ko-KR')}
        </p>

        <div className="btn-row" style={{ justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>목록으로</button>
          <button className="btn btn-primary" onClick={() => navigate(`/books/${book.id}/edit`)}>수정</button>
          <button className="btn btn-danger" onClick={handleDelete}>삭제</button>
        </div>
      </div>

      {/* 리뷰 섹션 */}
      <div className="book-detail" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 16 }}>리뷰 ({reviews.length})</h3>

        {/* 별점 분포 차트 */}
        {reviews.length > 0 && (() => {
          const counts = [1, 2, 3, 4, 5].map((star) =>
            reviews.filter((r) => r.rating === star).length
          );

          const maxCount = Math.max(...counts, 1);
          const mostStar = counts.indexOf(Math.max(...counts)) + 1;

          return (
            <div
              style={{
                width: '100%',
                maxWidth: 620,
                margin: '0 auto 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              {[5, 4, 3, 2, 1].map((star) => {
                const count = counts[star - 1];
                const width = `${(count / maxCount) * 100}%`;
                const isMax = star === mostStar && count > 0;

                return (
                  <div
                    key={star}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '42px 1fr 44px',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        textAlign: 'right',
                      }}
                    >
                      {star}점
                    </span>

                    <div
                      style={{
                        height: 16,
                        backgroundColor: 'rgba(245, 217, 139, 0.16)',
                        borderRadius: 999,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: count > 0 ? width : 0,
                          height: '100%',
                          backgroundColor: isMax ? '#f5a623' : '#f5d98b',
                          borderRadius: 999,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>

                    <span
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                      }}
                    >
                      {count}개
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* 정렬 필터 버튼 */}
        {reviews.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { key: 'latest', label: '최신순' },
              { key: 'high', label: '별점 높은순' },
              { key: 'low', label: '별점 낮은순' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setReviewSort(key)}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                  borderRadius: 20,
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  backgroundColor: reviewSort === key ? '#f5a623' : 'var(--card-bg)',
                  color: reviewSort === key ? '#fff' : 'var(--text-main)',
                  fontWeight: 700,
                  border: reviewSort === key ? '2px solid #e09400' : '1px solid var(--border)',
                }}
              >{label}</button>
            ))}
          </div>
        )}

        {/* 리뷰 목록 */}
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>아직 리뷰가 없습니다.</p>
        ) : (
          <ul style={{ listStyle: 'none', marginBottom: 24 }}>
            {[...reviews]
              .sort((a, b) => {
                if (reviewSort === 'high') return b.rating !== a.rating ? b.rating - a.rating : new Date(b.createdAt) - new Date(a.createdAt);
                if (reviewSort === 'low')  return a.rating !== b.rating ? a.rating - b.rating : new Date(b.createdAt) - new Date(a.createdAt);
                return new Date(b.createdAt) - new Date(a.createdAt);
              })
              .map((r) => (
                <li key={r.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{r.nickname}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ color: '#f5a623' }}>{'⭐'.repeat(r.rating)}</span>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                      onClick={() => {
                        if (deletingReviewId === r.id) {
                          setDeletingReviewId(null);
                          setDeletePassword('');
                        } else {
                          setDeletingReviewId(r.id);
                          setDeletePassword('');
                        }
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <p style={{ marginTop: 6, color: 'var(--text-main)', fontSize: '0.9rem', textAlign: 'left' }}>{r.content}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{new Date(r.createdAt).toLocaleDateString('ko-KR')}</p>
                {deletingReviewId === r.id && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                    <input
                      className="form-input"
                      type="password"
                      placeholder="비밀번호 입력"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', fontSize: '0.85rem' }}
                    />
                    <button className="btn btn-danger" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={() => handleReviewDelete(r.id)}>확인</button>
                    <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={() => { setDeletingReviewId(null); setDeletePassword(''); }}>취소</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* 리뷰 작성 폼 */}
        <h4 style={{ marginBottom: 12 }}>리뷰 작성</h4>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input className="form-input" style={{ flex: 1 }}
            placeholder="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          <input className="form-input" style={{ flex: 1 }}
            placeholder="삭제용 비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ marginRight: 8, fontSize: '0.9rem' }}>별점:</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} style={{ cursor: 'pointer', fontSize: '1.3rem', color: n <= rating ? '#f5a623' : '#ddd' }}
              onClick={() => setRating(n)}>★</span>
          ))}
        </div>
        <textarea className="form-input" style={{ width: '100%', resize: 'vertical' }}
          rows={3} placeholder="리뷰 내용을 입력하세요" value={content} onChange={(e) => setContent(e.target.value)} />
        {reviewError && <p style={{ color: '#e74c3c', fontSize: '0.9rem', margin: '6px 0' }}>{reviewError}</p>}
        <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={handleReviewSubmit}>등록</button>
      </div>

      {/* 연관 도서 추천 */}
      {relatedBooks.length > 0 && (
          <div className="book-detail" style={{ marginTop: 24 }}>
            <h3 style={{ marginBottom: 16 }}>같은 장르 추천 도서 ({book.category})</h3>
            <div className="book-grid">
              {relatedBooks.map((b) => (
                <div
                  key={b.id}
                  className="book-card"
                  onClick={() => navigate(`/books/${b.id}`)}
                  style={{ overflow: 'hidden' }}
                >
                  {b.coverImageUrl ? (
                    <img
                      src={b.coverImageUrl}
                      alt={b.title}
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
                    <h3>{b.title}</h3>
                    <p>{b.author}</p>
                    <p style={{ fontSize: '0.8rem', color: '#f5a623' }}>
                      ⭐ {b.avg_rating > 0 ? b.avg_rating.toFixed(1) : '평점 없음'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
      )}
    </div>
  );
}

export default BookDetailPage;
