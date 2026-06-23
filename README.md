# 📚 오늘의 서재 (Full-Stack Book Management System)

**AI 표지 생성 기능과 베이지안 평점 기반의 객관적인 도서 추천 시스템을 갖춘 풀스택 웹 애플리케이션입니다.**

- **개발 인원:** 팀 프로젝트 (총 8인)
- **개발 기간:** 2026.06.09 ~ 2026.06.12

---

## 👥 팀원 역할 및 분담 (R&R)

| 이름 | 역할 (Position) | 세부 담당 업무 (Responsibility) |
| :---: | :--- | :--- |
| **함지애** | **조장 / PM** | **[PM·기획]** ERD / API 명세서 작성, 통합 이슈 추적<br>**[프론트엔드]** CRUD API 연동 |
| **박진용** | **BE / FE / 발표** | **[백엔드]** Entity, Repository 작성, H2 콘솔 확인, Lombok 4종 적용<br>**[프론트엔드]** 스타일링, QA<br>**[공통]** 프로젝트 발표 (백엔드 파트) |
| **장윤재** | **BE / FE** | **[백엔드]** Service 클래스, 비즈니스 로직, NotFoundException, @Transactional<br>**[프론트엔드]** OpenAI API 연동 |
| **성예은** | **BE / FE** | **[백엔드]** Controller, 5종 CRUD 엔드포인트, @Valid + @NotBlank, Postman 테스트<br>**[프론트엔드]** UI, 레이아웃 구현 |
| **손진원** | **BE / FE** | **[통합·예외 처리]** Webconfig (CORS), GlobalExceptionHandler, 풀스택 디버깅, 트러블슈팅 정리<br>**[프론트엔드]** UI, 레이아웃 구현 |
| **김현석** | **통합 / 발표** | **[AI·DB 연동]** Frontend 코드 분석, fetch URL 변경, OpenAI 표지 흐름, E2E 시연 준비, DB(Supabase) 연결<br>**[공통]** 프로젝트 발표 (프론트엔드 파트) |
| **김만서** | **FE / QA / 서기** | **[서기·문서]** 회의록 작성 및 내용 정리, Postman 테스트 및 QA<br>**[프론트엔드]** OpenAI API 연동 |
| **공다연** | **기획 / 문서** | **[발표자료 정리·문서]** 내용 정리, 프로젝트 발표 자료 기획 및 시각 자료 생성 |

---

## 🛠 Tech Stack

**Frontend**<br>
![React](https://img.shields.io/badge/React%2019-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=react-router&logoColor=white)

**Backend**<br>
![Java 17](https://img.shields.io/badge/Java%2017-007396?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot 406](https://img.shields.io/badge/Spring%20Boot%204.0.6-6DB33F?style=flat-square&logo=springboot&logoColor=white)

**Database & Infra**<br>
![H2 Database](https://img.shields.io/badge/H2%20Database-000000?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)

💡 **DB 설정 안내:** 본 프로젝트의 메인 DB는 Supabase(PostgreSQL)로 구성되어 있습니다. 별도의 Supabase 계정 연동 없이 로컬에서 간편하게 실행하시려면, 백엔드 설정을 개발용 H2 DB(In-memory)로 변경해 주셔야 합니다.

**Tools & External API**<br>
![OpenAI](https://img.shields.io/badge/OpenAI%20API-412991?style=flat-square&logo=openai&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=flat-square&logo=postman&logoColor=white)
![Gradle](https://img.shields.io/badge/Gradle-02303A?style=flat-square&logo=gradle&logoColor=white)

---

## ✨ 주요 기능

### 1. 도서 관리 (CRUD) 및 카테고리 필터링

- 도서 등록, 수정, 삭제 및 상세 조회 기능
- KDC(한국십진분류법) 기반 카테고리(000~800) 지정 및 목록 필터링 기능

### 2. AI 표지 생성 (OpenAI API)

도서 등록 및 수정 페이지에서 `gpt-image-2` 모델을 활용하여 내용 기반의 표지 이미지를 자동 생성합니다.

- 사용자는 품질(Low/Medium/High)을 선택할 수 있으며, API Key는 서버로 전송되지 않고 브라우저(Local)에서만 안전하게 사용됩니다.

### 3. 리뷰 및 별점 관리

- 도서마다 1~5점의 별점과 리뷰를 등록할 수 있습니다.
- 닉네임과 비밀번호를 기반으로 작성자를 식별하며, 서버 단에서 비밀번호 검증 후 리뷰를 삭제하는 보안 로직이 적용되어 있습니다.

### 4. 베이지안 평점 기반 도서 추천

단순 평균 별점 산출 시 발생할 수 있는 통계적 왜곡(예: 리뷰 1개인 5점 도서가 우선 노출되는 현상)을 방지하기 위해 **베이지안 평점**을 도입했습니다.

- **메인 페이지:** 베이지안 점수 1위 도서 및 화제작 Best 3 노출
- **상세 페이지:** 동일 카테고리 내 추천 도서 자동 매칭

### 5. 사용자 맞춤 테마

- 우측 상단 팔레트에서 5가지 색상 테마로 UI를 변경할 수 있으며, 선택 값은 `localStorage`에 저장되어 유지됩니다.

---

## 🖥 주요 화면

<table width="100%">
  <tr>
    <td><img src="./book-app/screenshots/메인페이지.png" height="400" alt="메인 페이지"></td>
    <td><img src="./book-app/screenshots/도서목록페이지.png" height="400" alt="도서 목록"></td>
    <td><img src="./book-app/screenshots/도서목록페이지-최신순.png" height="400" alt="도서 목록 최신순"></td>
    <td><img src="./book-app/screenshots/도서상세페이지.png" height="400" alt="도서 상세"></td>
    <td><img src="./book-app/screenshots/도서등록페이지.png" height="400" alt="도서 등록"></td>
    <td><img src="./book-app/screenshots/도서수정페이지.png" height="400" alt="도서 수정"></td>
  </tr>
  <tr>
    <td align="center"><b>메인 페이지</b></td>
    <td align="center"><b>도서 목록</b></td>
    <td align="center"><b>도서 목록 (최신순)</b></td>
    <td align="center"><b>도서 상세</b></td>
    <td align="center"><b>도서 등록</b></td>
    <td align="center"><b>도서 수정</b></td>
  </tr>
</table>

---

## ⚙️ 시스템 구조 (Architecture)

### 백엔드 (Spring Boot)

Package by Feature 구조 형식을 사용하여 도메인 단위로 패키지를 분리 및 관리합니다.

```text
📦 src/main/java/com/aivle/bookserver
 ┣ 📂 book        # 도서 관련 비즈니스 로직 (Controller, Service, Repository, DTO)
 ┣ 📂 review      # 리뷰 관련 비즈니스 로직
 ┣ 📂 rating      # 베이지안 평점 계산을 위한 공통 로직
 ┣ 📂 config      # CORS 정책 및 DB 초기화 설정
 ┗ 📂 exception   # 전역 예외 처리 및 커스텀 예외
```

### 프론트엔드 (React)

```text
📦 book-app/src
 ┣ 📂 api         # Spring Boot 서버 통신 (config.js, books.js, reviews.js)
 ┣ 📂 components  # 공통 컴포넌트 (Header, 테마 설정 등)
 ┣ 📂 pages       # 페이지 단위 컴포넌트 (Main, BookList, BookDetail, BookForm)
 ┗ 📜 App.jsx     # 라우팅 설정
```

---

## 🗄 데이터베이스 설계 (ERD)

조회 성능을 극대화하기 위해 `BOOK` 테이블에 리뷰 관련 통계(평균 별점, 리뷰 수 등)를 포함하는 **반정규화**를 적용했습니다.

<img width="1403" height="1121" alt="ERD_update" src="https://github.com/user-attachments/assets/f73ff9db-134c-4970-a6d6-e8c50f737921" />

---

## 🔌 API 명세서 (API Reference)

### 📌 서버 기본 환경


- **Base URL:** `http://localhost:8080`
- **Database:** Production: Supabase (PostgreSQL) / Local: H2 In-memory

### 📚 도서 및 리뷰 API (Spring Boot)

| Domain | Method | Endpoint | 기능 | Request | Response |
| --- | --- | --- | --- | --- | --- |
| **Books** | **GET** | `/books` | 도서 목록 조회 | `[Query]` category (선택) | 200 (Book List) |
| | **GET** | `/books/{id}` | 도서 상세 조회 | - | 200 (Book) / 404 |
| | **POST** | `/books` | 도서 등록 | `[Body]` title(필수), author, content, category, coverImageUrl | 201 (Created) / 400 |
| | **PATCH** | `/books/{id}` | 도서 부분 수정 | `[Body]` 수정할 필드만 전달 (평점 관련 필드 무시) | 200 (Updated) / 400 / 404 |
| | **PATCH** | `/books/{id}/cover` | AI 표지 이미지 저장 | `[Body]` coverImageUrl(필수, Base64) | 200 (Updated) / 400 / 404 |
| | **DELETE** | `/books/{id}` | 도서 삭제 (연관 리뷰 포함) | - | 204 (No Content) / 404 |
| | **GET** | `/books/{id}/related` | 카테고리 추천 Top 3 | - | 200 (Book List) / 404 |
| | **POST** | `/books/ai-intro` | AI 도서 한줄소개 생성 | `[Body]` title(필수), author(선택) | 200 (Passthrough) / 500 |
| **Reviews**| **GET** | `/reviews` | 리뷰 목록 조회 | `[Query]` bookId(필수) | 200 (Review List) |
| | **POST** | `/reviews` | 리뷰 등록 (평점 자동 재계산)| `[Body]` bookId, nickname, password, rating (필수) / content | 201 (Created) / 400 |
| | **DELETE** | `/reviews/{id}` | 리뷰 삭제 (평점 자동 재계산)| `[Body]` password(필수) | 204 (No Content) / 400 / 404 |

### 🤖 외부 API (OpenAI)

| 기능 | Method | Endpoint |
| --- | --- | --- |
| AI 표지 이미지 생성 | **POST** | `https://api.openai.com/v1/images/generations` |

---

## ⭐ 도서 평점 계산 로직 (Bayesian Rating System)

$$rate\_point = \text{round}\left(\frac{C \times m + ratingSum}{C + reviewCount}, 1\right)$$

- $C$: 최소 투표 수 (고정값 5)
- $m$: 평점이 존재하는 전체 도서의 평균 별점 (데이터가 없을 시 초기값 3.5 적용)
- $ratingSum$: 해당 도서가 받은 별점의 총합
- $reviewCount$: 해당 도서의 총 리뷰 수

> **💡 Note:** 리뷰 등록 및 삭제 API 호출 시, 서버 내부 로직에 의해 베이지안 평점이 자동 재계산되어 DB에 동기화됩니다.

---

## 🔥 트러블 슈팅 (Troubleshooting)

<details>
<summary><b>1. 프레임워크 기본값과 클라우드 환경의 충돌: DB 커넥션 풀 고갈 이슈</b></summary>
<br>

- **문제 상황:** 로컬 환경과 달리 Supabase 연동 후 3명 이상의 팀원이 동시 접속 시 서버가 멈추거나 DB 연결 에러 발생.
- **원인 파악:** Spring Boot의 기본 DB 커넥션 풀(HikariCP)은 기동 시 10개의 커넥션을 선점함. Supabase 무료 티어의 제한된 허용 커넥션 수를 팀원들의 각 로컬 서버가 순식간에 고갈시킨 것이 원인.
- **해결 방안:** `application.yaml`에서 HikariCP의 `maximum-pool-size`를 `1`로 과감히 제한. 불필요한 여유 커넥션 점유를 막아 최대 15명이 동시에 안정적으로 접속할 수 있도록 인프라 환경 최적화.
</details>

<details>
<summary><b>2. 전역 예외 처리 고도화: 보안 강화 및 예외 범위 세분화</b></summary>
<br>

- **문제 상황:** 스택 트레이스 노출을 막기 위해 최상위 `Exception.class` Fallback 핸들러를 도입했으나, `400 Bad Request` 등 클라이언트 측 요청 오류까지 모두 `500 Internal Server Error`로 처리되는 부작용이 발생함. 더불어 도서 생성(POST)과 수정(PATCH) 간 DTO 공유로 인한 검증(Validation) 조건 충돌 문제도 확인됨.
- **원인 파악:** Fallback 핸들러가 너무 넓은 범위의 예외를 캐치하면서 Spring MVC의 기본 요청 예외까지 가로챘으며, API 요청 목적이 다름에도 동일한 DTO 검증 룰을 일괄 적용했기 때문임.
- **해결 방안:** 원래 400, 405로 응답해야 하는 Spring MVC 예외들을 `GlobalExceptionHandler`에 개별 핸들러로 명시하여 역할을 세분화함. Fallback 핸들러는 예상치 못한 서버 내부 오류만 처리하도록 축소하고, POST/PATCH 목적에 맞게 검증 로직을 컨트롤러 단으로 분리하여 API의 유연성과 안정성을 동시에 확보함.
</details>

> 🔗 **더 많은 트러블 슈팅 과정과 기술적 고민은 [팀 프로젝트 노션(트러블 슈팅)](https://app.notion.com/p/37c55c159ec3807b9d13ded76c995b85?source=copy_link)에서 확인하실 수 있습니다.**

---

## 🚀 실행 가이드 (Getting Started)

프로젝트 클론 후 프론트엔드와 백엔드를 각각 실행해야 합니다.

**1. 저장소 클론**

```bash
git clone [https://github.com/Jiae-Ham/AivleSchool_miniproj4.git](https://github.com/Jiae-Ham/AivleSchool_miniproj4.git)
```

**2. 백엔드 실행 (Spring Boot)**

### 💡 데이터베이스 설정 안내
본 프로젝트는 현재 별도로 서버에 배포되어 있지 않습니다. 따라서 프로젝트를 직접 실행하고 테스트하실 분들은 개발 및 로컬 환경 전용인 H2 DB(In-memory)로 연결하여 실행하시는 것을 권장합니다.

※ 만약 Supabase(PostgreSQL)를 사용하시려면, 본인의 Supabase 계정 정보를 .env 파일과 application.yaml에 직접 입력하여 연동해야 합니다.
  
  ```bash
  cd AivleSchool_miniproj4/bookserver
  ./gradlew build
  ./gradlew bootRun
  ```
  ##### H2로 실행할 경우
  ```bash
   ./gradlew bootRun --args='--spring.profiles.active=h2'
  ```

**3. 프론트엔드 실행 (React)**

- 새로운 터미널 창을 열고 프론트엔드 디렉터리로 이동하여 패키지를 설치합니다.
  
  ```bash
  cd AivleSchool_miniproj4/book-app
  npm install
  npm run dev
  ```
  
**4. 접속**

- 브라우저에서 `http://localhost:5173` 으로 접속하여 서비스를 이용합니다.
