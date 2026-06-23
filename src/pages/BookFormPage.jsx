import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBook, createBook, updateBook, updateBookCover } from '../api/books';
import { BASE_URL } from '../api/config';

const CATEGORIES = ['000 총류', '100 철학', '200 종교', '300 사회과학', '400 자연과학', '500 기술과학', '600 예술', '700 언어', '800 문학'];
const MODEL = 'gpt-image-2';
const QUALITIES = ['low', 'medium', 'high'];

function BookFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // AI 이미지 관련 상태
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [pendingImageUrl, setPendingImageUrl] = useState('');
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY || '');
  const [quality, setQuality] = useState('low');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      setTitle('');
      setAuthor('');
      setContent('');
      setCategory(CATEGORIES[0]);
      setCoverImageUrl('');
      setPendingImageUrl('');
      setError('');
      return;
    }
    async function fetchBook() {
      try {
        const res = await getBook(id);
        if (!res.ok) throw new Error('도서를 불러오지 못했습니다.');
        const data = await res.json();
        setTitle(data.title);
        setAuthor(data.author);
        setContent(data.content);
        setCategory(data.category || CATEGORIES[0]);
        setCoverImageUrl(data.coverImageUrl || '');
      } catch (err) {
        setError(err.message);
      }
    }
    fetchBook();
  }, [id, isEdit]);

  const handleGenerate = async () => {
    if (!apiKey.trim()) { alert('API 키를 입력해주세요.'); return; }
    if (!title.trim() && !content.trim()) { alert('제목 또는 내용을 먼저 입력해주세요.'); return; }
    setGenerating(true);
    // prompt 예시: `A book cover for "${title}". ${content}`
    //setTimeout(() => setGenerating(false), 2000); // 임시 딜레이
    try {
      const prompt = `책의 표지를 그릴 것이다. "${title}"라는 제목을 그림에 반드시 작성해라. 또한, 책의 내용: "${content}" 을(를) 읽고, 해당 책의 내용과 어울리는 표지를 그려라`;

      const OPENAI_IMAGE_API_URL = 'https://api.openai.com/v1/images/generations';

      const res = await fetch(OPENAI_IMAGE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          prompt,
          n: 1,
          size: '1024x1536',
          quality: quality,
          output_format: 'png',
          // response_format: 'b64_json'
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("OpenAI 에러 상세:", errorData); // F12 콘솔창에 자세한 에러 기록
        throw new Error(`요청 실패 사유: ${errorData.error?.message || '알 수 없는 에러'}`);
      }

      const data = await res.json();
      const b64Json = data.data?.[0]?.b64_json;
      const imageSrc = `data:image/png;base64,${b64Json}`;

      if (isEdit) {
        const saveRes = await updateBookCover(id, imageSrc);
        if (!saveRes.ok) throw new Error('데이터베이스 표지 업데이트에 실패했습니다.');
        setCoverImageUrl(imageSrc);
        setPendingImageUrl('');
        alert('AI 표지 생성 및 DB 저장이 완료되었습니다!');
      } else {
        setPendingImageUrl(imageSrc);
      }

    } catch (error) {
      console.error(error);
      alert('에러: ' + error.message);
    } finally {
      setGenerating(false); // 기존의 임시 딜레이 대신, 여기서 정상적으로 로딩 상태를 해제합니다.
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) { setError('제목을 입력해주세요.'); return; }
    setError('');
    setLoading(true);

    try {
      const now = new Date().toISOString();
      const finalImageUrl = pendingImageUrl || coverImageUrl;

      if (isEdit) {
        const res = await updateBook(id, { title, author, content, category, coverImageUrl: finalImageUrl, updatedAt: now });
        if (!res.ok) throw new Error('수정에 실패했습니다.');
      } else {
        const res = await createBook({
          title, author, content, category,
          coverImageUrl: finalImageUrl,
          avg_rating: 0,
          rate_point: 0,
          createdAt: now,
          updatedAt: now,
        });
        if (!res.ok) throw new Error('등록에 실패했습니다.');
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-form" style={{ maxWidth: 800 }}>
      <h2>{isEdit ? '도서 수정' : '새 도서 등록'}</h2>

      <div style={{ display: 'flex', gap: 32, marginBottom: 24 }}>

        {/* 왼쪽: 표지 이미지 + AI 설정 */}
        <div style={{ flexShrink: 0, width: 200 }}>

          {/* 표지 미리보기 */}
          <div style={{
            width: 200, height: 280,
            background: 'rgba(255,255,255,0.5)',
            border: '2px dashed rgba(255,255,255,0.8)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            overflow: 'hidden',
          }}>
            {(pendingImageUrl || coverImageUrl)
              ? <img src={pendingImageUrl || coverImageUrl} alt="표지" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: '#bbb', fontSize: '0.85rem', textAlign: 'center', padding: 8 }}>표지 이미지<br />미리보기</span>
            }
          </div>

          {/* API Key */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="form-input"
              style={{ width: '100%', padding: '7px 10px', fontSize: '0.85rem' }}
            />
          </div>

          {/* 모델 고정 표시 */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>모델</label>
            <div style={{ padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.85rem', background: '#f9f9f9', color: '#555' }}>
              {MODEL}
            </div>
          </div>

          {/* 품질 선택 */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>품질</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {QUALITIES.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  style={{
                    flex: 1, padding: '8px 0',
                    border: '1px solid rgba(255,255,255,0.8)',
                    borderRadius: 30,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    background: quality === q ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' : 'rgba(255,255,255,0.6)',
                    color: quality === q ? 'white' : 'var(--text-main)',
                    fontWeight: quality === q ? 600 : 500,
                    boxShadow: quality === q ? '0 4px 10px rgba(102, 126, 234, 0.4)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* 생성 버튼 */}
          <button
            className="btn btn-success"
            style={{ width: '100%' }}
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? '생성 중...' : 'AI 표지 생성'}
          </button>

          {generating && (
            <p style={{ textAlign: 'center', color: '#888', fontSize: '0.8rem', marginTop: 8 }}>
              이미지를 생성하고 있습니다...
            </p>
          )}
        </div>

        {/* 오른쪽: 도서 정보 입력 */}
        <div style={{ flex: 1 }}>
          <div className="form-group">
            <label>제목 *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="도서 제목을 입력하세요" />
          </div>

          <div className="form-group">
            <label>저자</label>
            <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="저자명" />
          </div>

          <div className="form-group">
            <label>카테고리</label>
            <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>내용</label>
            <textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} placeholder="도서 내용 또는 줄거리를 입력하세요" />
          </div>

          {error && <p style={{ color: '#e74c3c', marginBottom: 16, fontSize: '0.9rem' }}>{error}</p>}

          <div className="btn-row">
            <button className="btn btn-secondary" onClick={() => navigate(-1)} disabled={loading}>취소</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? '처리 중...' : isEdit ? '저장' : '등록'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookFormPage;
