import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  /**
   * A-01: AI 多声线扩写
   * 当前返回 mock 数据，后续接 LLM API
   */
  async expand(keywords: string[]) {
    const kw = keywords.join('、');
    return {
      versions: [
        {
          style: '感官轰炸版',
          preview: `当${kw}撕裂夜空的那一瞬间，地板的震动顺着脊椎窜上来。汗水、酒精、尖叫混成一片。你不知道自己在哪里，只知道这一刻是真的活着。`,
        },
        {
          style: '冷峻纪实版',
          preview: `本场演出的核心记忆点集中在${kw}。从技术层面看，乐手的配合度和即兴段落展现了编曲功底。`,
        },
        {
          style: '段子手版',
          preview: `说好来养生，结果${kw}开场三秒我就被人群挤到前排。吉他手看了我一眼——他在挑衅我。现在我脖子断了。`,
        },
      ],
    };
  }

  /**
   * A-02: AI 标签建议
   * 当前返回 mock 数据，后续接 LLM API
   */
  async suggestTags(body: string) {
    return {
      tags: ['氛围炸裂', '吉他solo']
        .filter(() => body.length > 10)
        .slice(0, 3),
    };
  }
}
