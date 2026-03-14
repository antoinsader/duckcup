from keybert import KeyBERT
from typing import List, Union, Tuple

from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError



class KeyBertKeywordExtractor:
    _shared_model = None

    def __init__(self):
        if KeyBertKeywordExtractor._shared_model is None:
            KeyBertKeywordExtractor._shared_model = KeyBERT()
        self.model : KeyBERT = KeyBertKeywordExtractor._shared_model

    def extract_keywords(self, 
                         document: Union[str, List[str]], 
                         top_n: int=5, 
                         keyphrase_ngram_range : Tuple[int, int]=(1, 3), 
                         diversity: float=0.7) -> Union[List[Tuple[str, float]], List[List[Tuple[str, float]]]]:
        """Extract keywords from a document or list of documents using KeyBERT.

        Args:
            document: A single document (string) or a list of documents to extract keywords from.
            keyphrase_ngram_range: Length, in words, of the extracted keywords/keyphrases.
            top_n: Return the top n keywords/keyphrases
            use_mmr: Whether to use Maximal Marginal Relevance (MMR) for the
        Returns:
            List of tuples (keyword, score) for a single document.
        """
        try:
            keywords = self.model.extract_keywords(document, 
                                               top_n=top_n, 
                                               keyphrase_ngram_range=keyphrase_ngram_range, 
                                               stop_words='english',
                                               use_mmr=True,
                                               diversity=diversity
                                               )
            return keywords
        except Exception as ex:
            raise InfrastructureError(
                f"KeyBERT keyword extraction failed",
                layer=INFRA_ERROR_LAYERS.KEYWORD_EXTRACTION,
                priority=3,
                ex=ex
            )

    @staticmethod
    def remove_subphrases(keywords_list : dict) -> dict:
        """Remove subphrases from the keywords list. keywords_list is dictionary where key is the keyword and value is float score."""
        try:
            phrases = [k[0] for k in keywords_list.items()]
            filtered = {}
            for phrase, score in keywords_list.items():
                if not any(phrase in other for other in phrases if phrase != other):
                    filtered[phrase] = score
            return filtered
        except Exception as ex:
            raise InfrastructureError(
                f"Error removing subphrases from list of keywords",
                layer=INFRA_ERROR_LAYERS.KEYWORD_EXTRACTION,
                priority=1,
                ex=ex
            )
