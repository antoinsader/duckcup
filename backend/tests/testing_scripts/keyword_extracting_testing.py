
from collections import defaultdict
from infrastructure.keyword_extraction.keybert import KeyBertKeywordExtractor

from infrastructure.ner.normalization import normalize_text, normalize_texts



def normal_way(texts):
    keyword_extractor = KeyBertKeywordExtractor()

    keyword_frequency = defaultdict(int)
    keyword_scores = defaultdict(list)


    for doc in texts:
        keywords = keyword_extractor.extract_keywords(doc, top_n=20)
        for phrase, score in keywords:
            norm = normalize_text(phrase)
            keyword_frequency[norm] += 1
            keyword_scores[norm].append(score)


    print(f"keyword_frequency: {keyword_frequency}")
    print(f"keyword_scores:  {keyword_scores}" )


    
    # combine frequency and average score for final ranking
    keyword_final_scores = {}
    for phrase in keyword_frequency:
        freq = keyword_frequency[phrase]
        avg_score = sum(keyword_scores[phrase]) / len(keyword_scores[phrase])
        combined_score = freq * avg_score
        keyword_final_scores[phrase] = combined_score

    #remove subphrases
    keywords_list = KeyBertKeywordExtractor.remove_subphrases(keyword_final_scores)

    #sort keywords by combined score
    sorted_keywords = sorted(keywords_list.items(), key=lambda item: item[1], reverse=True)
    print(f"sorted_keywords: {sorted_keywords}")

def optimized_way(texts):
    keyword_extractor = KeyBertKeywordExtractor()

    # Batch extract keywords for all documents
    keywords_per_doc = keyword_extractor.extract_keywords(texts, top_n=20)
    # Flatten all phrases and scores
    all_phrases = []
    all_scores = []
    for kw_list in keywords_per_doc:
        for phrase, score in kw_list:
            all_phrases.append(phrase)
            all_scores.append(score)

    # Batch normalize all phrases
    normalized_phrases = normalize_texts(all_phrases)

    # Aggregate frequency and scores for each normalized phrase
    keyword_frequency = defaultdict(int)
    keyword_scores = defaultdict(list)
    for norm, score in zip(normalized_phrases, all_scores):
        keyword_frequency[norm] += 1
        keyword_scores[norm].append(score)
    print(f"keyword_frequency: {keyword_frequency}")
    print(f"keyword_scores:  {keyword_scores}" )
    