import { AgeGroup, ChoiceType, EnrichedAnswer, Gender } from '../types/database';

export interface SeedDataBundle {
  responses: {
    id: string;
    session_id: string;
    gender: Gender;
    age_group: AgeGroup;
    created_at: string;
  }[];
  answers: {
    id: string;
    response_id: string;
    question_id: string;
    choice: ChoiceType;
    reason: string | null;
    created_at: string;
  }[];
}

const SAMPLE_ENTRIES: {
  gender: Gender;
  age_group: AgeGroup;
  q1: { choice: ChoiceType; reason: string };
  q2: { choice: ChoiceType; reason: string };
  q3: { choice: ChoiceType; reason: string };
}[] = [
  {
    gender: '남성',
    age_group: '20대',
    q1: { choice: 'A', reason: '다수 보행자의 생명 가치가 공리주의적으로 1명의 탑승자보다 우선되어야 합니다.' },
    q2: { choice: 'B', reason: '과거 데이터는 기존 사회의 성별·학벌 편향을 그대로 담고 있으므로 알고리즘 보정이 반드시 필요합니다.' },
    q3: { choice: 'A', reason: 'AI는 수많은 창작자들의 데이터를 무단 학습한 기계적 도구일 뿐이므로 저작권을 부여하면 안 됩니다.' }
  },
  {
    gender: '여성',
    age_group: '30대',
    q1: { choice: 'B', reason: '소비자가 자신의 안전을 보장하지 못하는 자율주행차를 구매하거나 탑승할 수는 없습니다.' },
    q2: { choice: 'B', reason: '공정한 기회를 보장하기 위해 인위적 가중치 조정으로 차별 요소를 사전에 제거해야 합니다.' },
    q3: { choice: 'B', reason: '인간과 다른 형태의 새로운 창작물로서 적절한 보호 체계가 있어야 AI 산업 발전과 질서가 유지됩니다.' }
  },
  {
    gender: '남성',
    age_group: '40대',
    q1: { choice: 'A', reason: '보행자는 자율주행차 탑승 여부를 선택할 권리조차 없었던 무고한 피해자이므로 보호가 우선입니다.' },
    q2: { choice: 'A', reason: '기업의 채용 효율성과 실제 성과 데이터의 객관성을 왜곡하면 안 된다고 생각합니다.' },
    q3: { choice: 'A', reason: '원작 예술가들의 권리를 침해할 우려가 매우 크며 독창성은 인간의 고유 영역입니다.' }
  },
  {
    gender: '여성',
    age_group: '20대',
    q1: { choice: 'A', reason: '도로 위 보행자 다수의 희생을 막는 것이 전체적인 사회적 손실을 최소화하는 길입니다.' },
    q2: { choice: 'B', reason: '과거 채용 관행의 차별이 AI라는 이름으로 영구화되는 것은 정의롭지 못합니다.' },
    q3: { choice: 'A', reason: '인간 예술가들의 노력을 보호하고 저작권 독점을 방지해야 합니다.' }
  },
  {
    gender: '여성',
    age_group: '50대',
    q1: { choice: 'B', reason: '제조사와 차량 시스템은 탑승 고객의 생명을 끝까지 지켜야 할 계약적 책임이 있습니다.' },
    q2: { choice: 'B', reason: '다양성과 공정성을 위해 편향된 통계에 대한 적극적 개입이 불가피합니다.' },
    q3: { choice: 'B', reason: '미래 디지털 콘텐츠 시장 규율을 위해 새로운 독점권 및 라이선스 제도가 시급합니다.' }
  },
  {
    gender: '남성',
    age_group: '30대',
    q1: { choice: 'A', reason: '인명 피해 규모를 최소화하는 윤리 알고리즘이 국제 표준이어야 합니다.' },
    q2: { choice: 'A', reason: '인위적 보정이 또 다른 역차별을 낳을 수 있으므로 실적 지표에 맡겨야 합니다.' },
    q3: { choice: 'A', reason: '빅데이터 통계 모델의 결과물에 인간과 동등한 권리를 부여할 수는 없습니다.' }
  },
  {
    gender: '여성',
    age_group: '40대',
    q1: { choice: 'B', reason: '차량을 신뢰하고 탄 승객을 차가 임의로 희생시키는 설계는 도덕적 수용성이 낮습니다.' },
    q2: { choice: 'B', reason: '사회적 약자 보호와 채용 평등을 위한 가중치 필터링이 필수적입니다.' },
    q3: { choice: 'B', reason: '인간과 구별되는 새로운 인접 저작권 제도를 마련해야 분쟁을 줄일 수 있습니다.' }
  },
  {
    gender: '남성',
    age_group: '10대',
    q1: { choice: 'A', reason: '여러 명의 생명을 살리는 선택이 합리적이라고 봅니다.' },
    q2: { choice: 'B', reason: '불공정한 시험이나 면접 데이터는 수정되어야 공정합니다.' },
    q3: { choice: 'B', reason: '프롬프트 입력과 편집 과정도 창작 행위의 일종으로 인정받아야 합니다.' }
  },
  {
    gender: '남성',
    age_group: '60대 이상',
    q1: { choice: 'B', reason: '차를 탄 사람의 생명을 차량 자체가 포기하는 기술은 누구도 믿고 타지 않을 것입니다.' },
    q2: { choice: 'A', reason: '과거 실적과 능력 위주의 검증된 기준을 임의로 뜯어고치는 것은 혼란을 초래합니다.' },
    q3: { choice: 'A', reason: '기계가 만든 것에 법적 권리를 주면 원작자인 인간의 권리가 크게 훼손됩니다.' }
  },
  {
    gender: '여성',
    age_group: '10대 미만',
    q1: { choice: 'A', reason: '사람이 더 많은 쪽을 구하는 게 맞아요.' },
    q2: { choice: 'B', reason: '차별 없이 모두에게 기회가 공평해야 해요.' },
    q3: { choice: 'A', reason: '로봇이 그린 그림은 사람이 그린 진짜 그림이랑 달라요.' }
  },
  {
    gender: '여성',
    age_group: '60대 이상',
    q1: { choice: 'B', reason: '내 차가 나를 배신한다는 불안감이 있으면 자율주행차 산업은 정착할 수 없습니다.' },
    q2: { choice: 'B', reason: '사회의 균형과 소외 계층 배려를 위해 기술이 선한 방향으로 교정되어야 합니다.' },
    q3: { choice: 'A', reason: '인간 고유의 영혼과 감성이 담긴 예술적 가치를 보호해야 합니다.' }
  },
  {
    gender: '남성',
    age_group: '50대',
    q1: { choice: 'A', reason: '다수의 생명을 보호하는 대원칙이 교통 안전 윤리의 기본입니다.' },
    q2: { choice: 'A', reason: '인위적 통계 조작은 조직의 직무 적합성과 경쟁력을 떨어뜨릴 수 있습니다.' },
    q3: { choice: 'A', reason: '기계적 연산 산출물은 공공재적 성격으로 두어야 창작 생태계가 유지됩니다.' }
  }
];

export function generateSeedBundle(q1Id: string, q2Id: string, q3Id: string): SeedDataBundle {
  const responses: SeedDataBundle['responses'] = [];
  const answers: SeedDataBundle['answers'] = [];

  const now = Date.now();

  SAMPLE_ENTRIES.forEach((entry, idx) => {
    const responseId = `resp-seed-${idx + 1}`;
    const timestamp = new Date(now - (SAMPLE_ENTRIES.length - idx) * 3600000 * 4).toISOString();

    responses.push({
      id: responseId,
      session_id: `session-mock-${idx + 1}`,
      gender: entry.gender,
      age_group: entry.age_group,
      created_at: timestamp,
    });

    // Q1 answer
    answers.push({
      id: `ans-${responseId}-1`,
      response_id: responseId,
      question_id: q1Id,
      choice: entry.q1.choice,
      reason: entry.q1.reason,
      created_at: timestamp,
    });

    // Q2 answer
    answers.push({
      id: `ans-${responseId}-2`,
      response_id: responseId,
      question_id: q2Id,
      choice: entry.q2.choice,
      reason: entry.q2.reason,
      created_at: timestamp,
    });

    // Q3 answer
    answers.push({
      id: `ans-${responseId}-3`,
      response_id: responseId,
      question_id: q3Id,
      choice: entry.q3.choice,
      reason: entry.q3.reason,
      created_at: timestamp,
    });
  });

  return { responses, answers };
}
