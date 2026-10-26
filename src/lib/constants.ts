import { AgeGroup, Gender, Question } from '../types/database';

export const GENDERS: Gender[] = ['남성', '여성'];

export const AGE_GROUPS: AgeGroup[] = [
  '10대 미만',
  '10대',
  '20대',
  '30대',
  '40대',
  '50대',
  '60대 이상',
];

export const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 'q1-autonomous-vehicle',
    order_num: 1,
    title: '자율주행차의 사고 판단',
    scenario:
      '브레이크가 고장 난 자율주행차가 다수의 보행자와 충돌하거나, 방향을 틀어 탑승자 1명을 위험에 빠뜨려야만 하는 긴급 상황입니다.',
    choice_a_label:
      '다수 보행자의 안전을 위해 탑승자를 희생하도록 프로그래밍되어야 한다.',
    choice_b_label:
      '탑승자 보호가 최우선이므로 보행자 경로로 진행할 수밖에 없다.',
    is_active: true,
  },
  {
    id: 'q2-recruitment-ai-bias',
    order_num: 2,
    title: '채용 AI의 데이터 편향',
    scenario:
      '채용 AI가 과거 10년간의 합격 데이터를 학습한 결과, 과거 합격 비율이 낮았던 특정 집단이 불리하게 평가되는 경향이 나타났습니다.',
    choice_a_label:
      '데이터 기반의 효율성과 검증된 성과 유지를 위해 개입 없이 그대로 적용해야 한다.',
    choice_b_label:
      '과거의 사회적 편향이 재생산되는 것을 막기 위해 인위적으로 가중치를 보정해야 한다.',
    is_active: true,
  },
  {
    id: 'q3-generative-ai-copyright',
    order_num: 3,
    title: '생성형 AI 창작물 저작권',
    scenario:
      '생성형 AI가 인간 예술가의 화풍을 학습하여 인간 수준의 독창적인 예술 작품을 완성했습니다.',
    choice_a_label:
      'AI는 도구에 불과하므로 독점적 저작권이나 법적 권리를 인정해선 안 된다.',
    choice_b_label:
      '새로운 차원의 독창성을 인정하여 별도의 새로운 법적 보호 체계를 부여해야 한다.',
    is_active: true,
  },
];

export const KOREAN_STOPWORDS = new Set([
  '은', '는', '이', '가', '을', '를', '의', '에', '로', '으로',
  '하고', '때문에', '생각한다', '생각합니다', '합니다', '한다', '것이다',
  '그리고', '하지만', '너무', '진짜', '그냥', '것이', '대한', '있다고',
  '수', '등', '더', '잘', '이런', '저런', '같다', '같습니다', '저는', '제가',
  '경우', '대해', '관한', '통해', '모든', '의해', '어떤', '다시', '조금',
  '많이', '아닌', '또한', '이미', '가장', '매우', '어느', '있는', '없는',
  '위해', '통한', '따라', '함께', '보다', '이유는', '때문입니다', '봐야'
]);

export const SUPABASE_SQL_SCHEMA = `-- 1. questions 테이블 생성
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_num INT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    scenario TEXT NOT NULL,
    choice_a_label TEXT NOT NULL,
    choice_b_label TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. responses 테이블 생성
CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    gender TEXT NOT NULL,
    age_group TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. answers 테이블 생성
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    choice TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS (Row Level Security) 설정 (비회원 익명 참여 허용)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on responses" ON responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on responses" ON responses FOR SELECT USING (true);
CREATE POLICY "Allow public insert on answers" ON answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on answers" ON answers FOR SELECT USING (true);

-- 5. 기본 문항 시드 데이터 삽입
INSERT INTO questions (order_num, title, scenario, choice_a_label, choice_b_label)
VALUES 
(1, '자율주행차의 사고 판단', '브레이크가 고장 난 자율주행차가 다수의 보행자와 충돌하거나, 방향을 틀어 탑승자 1명을 위험에 빠뜨려야만 하는 긴급 상황입니다.', '다수 보행자의 안전을 위해 탑승자를 희생하도록 프로그래밍되어야 한다.', '탑승자 보호가 최우선이므로 보행자 경로로 진행할 수밖에 없다.'),
(2, '채용 AI의 데이터 편향', '채용 AI가 과거 10년간의 합격 데이터를 학습한 결과, 과거 합격 비율이 낮았던 특정 집단이 불리하게 평가되는 경향이 나타났습니다.', '데이터 기반의 효율성과 검증된 성과 유지를 위해 개입 없이 그대로 적용해야 한다.', '과거의 사회적 편향이 재생산되는 것을 막기 위해 인위적으로 가중치를 보정해야 한다.'),
(3, '생성형 AI 창작물 저작권', '생성형 AI가 인간 예술가의 화풍을 학습하여 인간 수준의 독창적인 예술 작품을 완성했습니다.', 'AI는 도구에 불과하므로 독점적 저작권이나 법적 권리를 인정해선 안 된다.', '새로운 차원의 독창성을 인정하여 별도의 새로운 법적 보호 체계를 부여해야 한다.')
ON CONFLICT (order_num) DO NOTHING;
`;
