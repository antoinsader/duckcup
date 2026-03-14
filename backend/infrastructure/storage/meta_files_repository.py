

from enum import Enum
import os



from api.core.config import settings
from infrastructure.utils.pkl import get_pkl, save_pkl




class META_FILES(str, Enum):
    HUGGING_FACE_MODELS_META = 'hugging_face_models'
    POLLINATION_MODELS = 'pollination_models'



class MetaFilesRepository:
    def __init__(self, file_name: META_FILES):
        self.meta_file_path = f"{settings.meta_dir}/{file_name.value}.pkl"

    def save_meta_file(self, meta_info):
        save_pkl(meta_info, self.meta_file_path)
        return True


    def load_meta_file(self):
        if os.path.exists(self.meta_file_path):
            info = get_pkl(self.meta_file_path)
            return info
        return []
