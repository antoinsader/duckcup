import os
import pickle

from maillib.core.exceptions import InfrastructureError, INFRA_ERROR_LAYERS

def save_pkl(ar, fp):
    try:
        os.makedirs(os.path.dirname(fp), exist_ok=True)
        with open(fp, 'wb') as f:
            pickle.dump(ar, f)
    except Exception as ex:
        raise InfrastructureError(
            f"Error saving pickle at path: {fp}",
            layer=INFRA_ERROR_LAYERS.PICKLING,
            priority=1,
            ex=ex
        )
def get_pkl(fp):
    try:
        with open(fp, "rb") as f:
            return pickle.load(f)


    except FileNotFoundError as ex:
        raise InfrastructureError(
            f"File not found: {fp}",
            layer=INFRA_ERROR_LAYERS.STORAGE,
            priority=2,
            ex=ex
        )
    except Exception as ex:
        raise InfrastructureError(
            f"Error saving pickle at path: {fp}",
            layer=INFRA_ERROR_LAYERS.STORAGE,
            priority=1,
            ex=ex
        )

def remove_file(fp):
    try:
        if os.path.exists(fp):
            os.remove(fp)
            return True
    except Exception as ex:
        raise InfrastructureError(
            f"Failed to delete file: {fp}",
            layer=INFRA_ERROR_LAYERS.STORAGE,
            priority=2,
            ex=ex
        )
