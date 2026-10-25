/**
 * TF-IDF Vectorizer and Cosine Similarity Engine
 * Algorithm 1 from NextCourse specification:
 * S_content(u, c) = (v_u . v_c) / (||v_u|| ||v_c||)
 */

export class TFIDFEngine {
  private vocabulary: Map<string, number> = new Map();
  private idf: Map<string, number> = new Map();
  private isTrained: boolean = false;

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9+#_ -]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));
  }

  public fit(documents: string[]): void {
    const docTermFreqs: Map<string, number>[] = [];
    const docFreq: Map<string, number> = new Map();
    let termIndex = 0;

    for (const doc of documents) {
      const tokens = this.tokenize(doc);
      const uniqueTokensInDoc = new Set<string>();
      const tfMap = new Map<string, number>();

      for (const token of tokens) {
        tfMap.set(token, (tfMap.get(token) || 0) + 1);
        if (!uniqueTokensInDoc.has(token)) {
          uniqueTokensInDoc.add(token);
          docFreq.set(token, (docFreq.get(token) || 0) + 1);
        }
        if (!this.vocabulary.has(token)) {
          this.vocabulary.set(token, termIndex++);
        }
      }
      docTermFreqs.push(tfMap);
    }

    const N = documents.length;
    for (const [term, df] of docFreq.entries()) {
      // Smoothed IDF: log(1 + (N / (1 + df))) + 1
      this.idf.set(term, Math.log((N + 1) / (df + 1)) + 1);
    }

    this.isTrained = true;
  }

  public transform(text: string): Map<number, number> {
    if (!this.isTrained) {
      throw new Error('TFIDFEngine must be fitted before transform');
    }

    const tokens = this.tokenize(text);
    const tf = new Map<string, number>();
    for (const t of tokens) {
      tf.set(t, (tf.get(t) || 0) + 1);
    }

    const vector = new Map<number, number>();
    let normSq = 0;

    for (const [token, count] of tf.entries()) {
      const idx = this.vocabulary.get(token);
      if (idx !== undefined) {
        const idfVal = this.idf.get(token) || 1.0;
        const weight = (1 + Math.log(count)) * idfVal;
        vector.set(idx, weight);
        normSq += weight * weight;
      }
    }

    // L2 Normalize
    const norm = Math.sqrt(normSq);
    if (norm > 0) {
      for (const [idx, val] of vector.entries()) {
        vector.set(idx, val / norm);
      }
    }

    return vector;
  }

  public cosineSimilarity(v1: Map<number, number>, v2: Map<number, number>): number {
    let dot = 0;
    // Iterate over the smaller vector
    const [smaller, larger] = v1.size <= v2.size ? [v1, v2] : [v2, v1];
    for (const [idx, val1] of smaller.entries()) {
      const val2 = larger.get(idx);
      if (val2 !== undefined) {
        dot += val1 * val2;
      }
    }
    return Math.min(1.0, Math.max(0.0, dot));
  }
}

const STOP_WORDS = new Set([
  'and', 'the', 'for', 'with', 'this', 'that', 'from', 'into', 'over', 'under',
  'after', 'before', 'between', 'during', 'without', 'about', 'against', 'among',
  'throughout', 'despite', 'towards', 'upon', 'concerning', 'to', 'in', 'of',
  'on', 'at', 'by', 'an', 'a', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'will', 'would',
  'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'ought', 'learn',
  'course', 'intro', 'introduction', 'master', 'fundamentals', 'programming'
]);
