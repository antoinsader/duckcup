

import os
import pickle

from api.core.config import settings

from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError


from infrastructure.encryption._encrypter import Encrypter
from infrastructure.utils.pkl import get_pkl, remove_file, save_pkl

class FileDatasetRepository:
    def __init__(self, user_id, ds_name, encrypter: Encrypter):
        self.user_mails_folder = f"{settings.user_datasets_content_dir}/{user_id}/{ds_name}"
        self.ds_path =  f"{self.user_mails_folder}/dataset.pkl"
        # self.embs_path =  f"{self.user_mails_folder}/embs.pkl"
        # self.embs_map_path =  f"{self.user_mails_folder}/embs_map.pkl"
        self.advanced_summary_path = f"{self.user_mails_folder}/adv_summary.pkl"
        self.encrypter = encrypter

    def save_dataset(self, data: list[dict]):
        """Encrypts and saves dataset content (list of dict) to a file"""
        try:
            plain_text = pickle.dumps(data, protocol=pickle.HIGHEST_PROTOCOL)
            cipher_text = self.encrypter.encrypt(plain_text)
            os.makedirs(os.path.dirname(self.ds_path), exist_ok=True)
            save_pkl(cipher_text, self.ds_path)
            return True
        except Exception as ex:
            raise InfrastructureError(
                f"Error saving dataset file.",
                priority=2,
                ex=ex,
                layer=INFRA_ERROR_LAYERS.STORAGE
            )



    def load_dataset(self) -> list[dict]:
        """Decrypts dataset content and returns it"""
        try:
            cipher_text = get_pkl(self.ds_path)
            plain_text = self.encrypter.decrypt(cipher_text)
            emails = pickle.loads(plain_text)
            return emails
        except Exception as ex:
            raise InfrastructureError(
                f"Error loading dataset file.",
                priority=2,
                ex=ex,
                layer=INFRA_ERROR_LAYERS.STORAGE
            )


    def remove_dataset_files(self):
        remove_file(self.ds_path)
        # remove_file(self.embs_path)
        # remove_file(self.embs_map_path)
        remove_file(self.advanced_summary_path)


    # def save_embs(self, embs, embs_mapping):
    #     save_pkl(embs, self.embs_path)
    #     save_pkl(embs_mapping, self.embs_map_path)
    #     return True

    # def load_embs(self, map_values):
    #     embs = get_pkl(self.embs_path)
    #     embs_mapping = get_pkl(self.embs_map_path)
    #     idxs = [embs_mapping.index(v) for v in map_values]
    #     selected_embs = [embs[idx] for idx in idxs]
    #     return np.array(selected_embs)

    def save_emails_adv_summary(self, email_ids: list[int], prompter_name: str, model_name: str, summaries: list[str]):
        # ! To do: encrypting content.

        if os.path.exists(self.advanced_summary_path):
            summaries = get_pkl(self.advanced_summary_path)
        else:
            os.makedirs(os.path.dirname(self.advanced_summary_path), exist_ok=True)
            summaries = {}

        for e_id, sum in zip(email_ids, summaries):
            summaries[(prompter_name, model_name, e_id)] = sum

        save_pkl(summaries, self.advanced_summary_path)
        return True


    def save_email_adv_summary(self, email_id: int, prompter_name: str, model_name:str, summary:str):
        # ! To do: encrypting content.

        if not os.path.exists(self.advanced_summary_path):
            os.makedirs(os.path.dirname(self.advanced_summary_path), exist_ok=True)
            summaries = {(prompter_name, model_name, email_id): summary}
        else:
            summaries = get_pkl(self.advanced_summary_path)
            summaries[(prompter_name, model_name, email_id)] = summary

        save_pkl(summaries, self.advanced_summary_path)
        return True

    def get_email_adv_summary(self, email_id, prompter_name, model_name):
        summaries = get_pkl(self.advanced_summary_path)
        return summaries.get((prompter_name, model_name, email_id), None)
