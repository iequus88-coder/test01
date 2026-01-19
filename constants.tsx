
import React from 'react';
import { Site } from './types';

export const SITES: Site[] = [
  { id: 'S1', name: '경기 안성 미양면 스마트 공장 지붕', type: 'ROOF', address: '경기도 안성시 미양면 제4산단로', manager: '홍길동', workPeriod: '03.01 ~ 05.30' },
  { id: 'S2', name: '경기 이천 마장면 노지 태양광 발전소', type: 'GROUND', address: '경기도 이천시 마장면 덕평로', manager: '이순신', workPeriod: '04.15 ~ 08.20' },
  { id: 'S3', name: '경기 평택 포승읍 물류창고 옥상', type: 'ROOF', address: '경기도 평택시 포승읍 평택항로', manager: '김철수', workPeriod: '05.01 ~ 07.15' },
  { id: 'S4', name: '경기 여주 가남읍 야산형 태양광 단지', type: 'GROUND', address: '경기도 여주시 가남읍 경충대로', manager: '박영희', workPeriod: '02.20 ~ 11.30' },
  { id: 'S5', name: '충북 음성 대소면 산업단지 발전소', type: 'ROOF', address: '충청북도 음성군 대소면 산단길', manager: '최강수', workPeriod: '06.01 ~ 09.30' },
];

export const CHECKLISTS = {
  ROOF: [
    '추락 방지용 안전고리 체결 확인',
    '지붕 구조물 파손 및 부식 여부 점검',
    '사다리 및 고소작업대 안전 확보',
    '기상 상황 확인 (강풍, 강우 시 중지)'
  ],
  GROUND: [
    '장비(포크레인 등) 작업 반경 통제',
    '굴착 부위 붕괴 방지 조치',
    '지중 매설물 위치 확인',
    '분전함 및 전선 절연 상태 확인'
  ]
};

export const RISK_FACTORS = [
  '고소 작업 중 추락 위험',
  '전기 설비 작업 중 감전 위험',
  '중량물 취급 중 끼임 위험',
  '열사병 및 탈수 위험',
  '이동 장비와 충돌 위험'
];
