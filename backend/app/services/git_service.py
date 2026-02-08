import os
import subprocess
from typing import Dict, List, Optional


class GitService:
    """Service for Git version control operations"""

    @staticmethod
    def init_repository(project_id: int) -> bool:
        """
        Initialize a Git repository for a project
        Returns True if successful, False otherwise
        """
        from app.services.filesystem_service import FileSystemService

        project_dir = FileSystemService.get_project_dir(project_id)

        if not project_dir.exists():
            return False

        try:
            # Initialize git repository
            subprocess.run(["git", "init"], cwd=project_dir, check=True, capture_output=True)

            # Create .gitignore
            gitignore_content = """node_modules/
dist/
build/
.DS_Store
*.log
.env
.env.local
"""
            (project_dir / ".gitignore").write_text(gitignore_content)

            # Configure git user (for commits)
            subprocess.run(
                ["git", "config", "user.name", "ArtReal AI"], cwd=project_dir, check=True, capture_output=True
            )
            subprocess.run(
                ["git", "config", "user.email", "ai@artreal.app"], cwd=project_dir, check=True, capture_output=True
            )

            # Initial commit
            subprocess.run(["git", "add", "."], cwd=project_dir, check=True, capture_output=True)
            subprocess.run(
                ["git", "commit", "-m", "Initial commit: Project scaffolding"],
                cwd=project_dir,
                check=True,
                capture_output=True,
            )

            return True
        except subprocess.CalledProcessError as e:
            print(f"Git init failed: {e}")
            return False

    @staticmethod
    def commit_changes(project_id: int, message: str, files: Optional[List[str]] = None) -> bool:
        """
        Commit changes to the Git repository

        Args:
            project_id: The project ID
            message: Commit message
            files: Optional list of specific files to commit. If None, commits all changes.

        Returns:
            True if successful, False otherwise
        """
        from app.services.filesystem_service import FileSystemService

        project_dir = FileSystemService.get_project_dir(project_id)

        if not project_dir.exists() or not (project_dir / ".git").exists():
            return False

        try:
            # Add files
            if files:
                for file in files:
                    subprocess.run(["git", "add", file], cwd=project_dir, check=True, capture_output=True)
            else:
                subprocess.run(["git", "add", "."], cwd=project_dir, check=True, capture_output=True)

            # Check if there are changes to commit
            result = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=project_dir, capture_output=True)

            # If exit code is 1, there are changes to commit
            if result.returncode == 1:
                subprocess.run(["git", "commit", "-m", message], cwd=project_dir, check=True, capture_output=True)
                return True

            # No changes to commit
            return True

        except subprocess.CalledProcessError as e:
            print(f"Git commit failed: {e}")
            return False

    @staticmethod
    def get_commit_history(project_id: int, limit: int = 10) -> List[Dict[str, str]]:
        """
        Get commit history for a project

        Returns a list of commits with hash, author, date, and message
        """
        from app.services.filesystem_service import FileSystemService

        project_dir = FileSystemService.get_project_dir(project_id)

        if not project_dir.exists() or not (project_dir / ".git").exists():
            return []

        try:
            # Get commit log with ISO timestamps including timezone
            # Using %aI for ISO 8601 strict format
            result = subprocess.run(
                ["git", "log", f"-{limit}", "--pretty=format:%H|%an|%aI|%s"],
                cwd=project_dir,
                check=True,
                capture_output=True,
                encoding="utf-8",
                errors="replace",
            )

            commits = []
            for line in result.stdout.strip().split("\n"):
                if line:
                    from datetime import datetime, timezone
                    hash, author, date_str, message = line.split("|", 3)
                    # Parse the ISO format date and convert to UTC
                    dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                    # Convert to UTC
                    utc_dt = dt.astimezone(timezone.utc)
                    # Format as ISO string
                    utc_date = utc_dt.isoformat()
                    commits.append({"hash": hash, "author": author, "date": utc_date, "message": message})

            return commits

        except subprocess.CalledProcessError as e:
            print(f"Git log failed: {e}")
            return []

    @staticmethod
    def get_file_at_commit(project_id: int, filepath: str, commit_hash: str) -> Optional[str]:
        """
        Get file content at a specific commit

        Returns the file content or None if not found
        """
        from app.services.filesystem_service import FileSystemService

        project_dir = FileSystemService.get_project_dir(project_id)

        if not project_dir.exists() or not (project_dir / ".git").exists():
            return None

        try:
            result = subprocess.run(
                ["git", "show", f"{commit_hash}:{filepath}"],
                cwd=project_dir,
                check=True,
                capture_output=True,
                encoding="utf-8",
                errors="replace",
            )

            return result.stdout

        except subprocess.CalledProcessError:
            return None

    @staticmethod
    def get_diff(project_id: int, filepath: Optional[str] = None) -> str:
        """
        Get diff of uncommitted changes

        Args:
            project_id: The project ID
            filepath: Optional specific file to diff. If None, shows all changes.

        Returns:
            Diff output as string
        """
        from app.services.filesystem_service import FileSystemService

        project_dir = FileSystemService.get_project_dir(project_id)

        if not project_dir.exists() or not (project_dir / ".git").exists():
            return ""

        try:
            cmd = ["git", "diff"]
            if filepath:
                cmd.append(filepath)

            result = subprocess.run(
                cmd, cwd=project_dir, check=True, capture_output=True, encoding="utf-8", errors="replace"
            )

            return result.stdout

        except subprocess.CalledProcessError:
            return ""

    @staticmethod
    def restore_commit(project_id: int, commit_hash: str) -> bool:
        """
        Restore project to a specific commit using hard reset.
        This will discard all changes after the specified commit.

        Returns True if successful, False otherwise
        """
        from app.services.filesystem_service import FileSystemService

        project_dir = FileSystemService.get_project_dir(project_id)

        if not project_dir.exists() or not (project_dir / ".git").exists():
            return False

        try:
            # First, verify the commit exists
            result = subprocess.run(
                ["git", "rev-parse", "--verify", commit_hash],
                cwd=project_dir,
                check=True,
                capture_output=True,
                encoding="utf-8",
                errors="replace"
            )

            # Hard reset to the commit (discards all changes after it)
            subprocess.run(
                ["git", "reset", "--hard", commit_hash],
                cwd=project_dir,
                check=True,
                capture_output=True,
                encoding="utf-8",
                errors="replace"
            )

            return True

        except subprocess.CalledProcessError as e:
            stderr = e.stderr.decode('utf-8', errors='replace') if isinstance(e.stderr, bytes) else str(e.stderr)
            print(f"Git restore failed: {stderr}")
            return False

    @staticmethod
    def checkout_commit(project_id: int, commit_hash: str) -> bool:
        """
        Checkout a specific commit temporarily (detached HEAD state).
        This allows viewing the project at that commit without modifying history.

        Returns True if successful, False otherwise
        """
        from app.services.filesystem_service import FileSystemService

        project_dir = FileSystemService.get_project_dir(project_id)

        if not project_dir.exists() or not (project_dir / ".git").exists():
            return False

        try:
            # Verify the commit exists
            subprocess.run(
                ["git", "rev-parse", "--verify", commit_hash],
                cwd=project_dir,
                check=True,
                capture_output=True,
                encoding="utf-8",
                errors="replace"
            )

            # Checkout the specific commit (detached HEAD)
            subprocess.run(
                ["git", "checkout", commit_hash],
                cwd=project_dir,
                check=True,
                capture_output=True,
                encoding="utf-8",
                errors="replace"
            )

            return True

        except subprocess.CalledProcessError as e:
            stderr = e.stderr.decode('utf-8', errors='replace') if isinstance(e.stderr, bytes) else str(e.stderr)
            print(f"Git checkout failed: {stderr}")
            return False

    @staticmethod
    def checkout_branch(project_id: int, branch_name: str = "main") -> bool:
        """
        Checkout a branch (returns to normal branch state from detached HEAD).

        Returns True if successful, False otherwise
        """
        from app.services.filesystem_service import FileSystemService

        project_dir = FileSystemService.get_project_dir(project_id)

        if not project_dir.exists() or not (project_dir / ".git").exists():
            return False

        try:
            # Checkout the branch
            subprocess.run(
                ["git", "checkout", branch_name],
                cwd=project_dir,
                check=True,
                capture_output=True,
                encoding="utf-8",
                errors="replace"
            )

            return True

        except subprocess.CalledProcessError as e:
            stderr = e.stderr.decode('utf-8', errors='replace') if isinstance(e.stderr, bytes) else str(e.stderr)
            print(f"Git checkout branch failed: {stderr}")
            return False

    @staticmethod
    def get_current_branch(project_id: int) -> str:
        """
        Get the current branch name or commit hash if in detached HEAD state

        Returns the branch name, commit hash (if detached), or 'main' as default
        """
        from app.services.filesystem_service import FileSystemService

        project_dir = FileSystemService.get_project_dir(project_id)

        if not project_dir.exists() or not (project_dir / ".git").exists():
            return "main"

        try:
            result = subprocess.run(
                ["git", "rev-parse", "--abbrev-ref", "HEAD"],
                cwd=project_dir,
                check=True,
                capture_output=True,
                encoding="utf-8",
                errors="replace",
            )

            branch = result.stdout.strip()

            # If HEAD is detached, return the commit hash
            if branch == "HEAD":
                result = subprocess.run(
                    ["git", "rev-parse", "--short", "HEAD"],
                    cwd=project_dir,
                    check=True,
                    capture_output=True,
                    encoding="utf-8",
                    errors="replace",
                )
                return f"detached:{result.stdout.strip()}"

            return branch

        except subprocess.CalledProcessError:
            return "main"

    @staticmethod
    def get_remote_config(project_id: int) -> Dict[str, str]:
        """
        Get remote configuration (URL and name)

        Returns dict with remote_name and remote_url
        """
        from app.services.filesystem_service import FileSystemService

        project_dir = FileSystemService.get_project_dir(project_id)

        if not project_dir.exists() or not (project_dir / ".git").exists():
            return {"remote_name": "origin", "remote_url": ""}

        try:
            # Get remote URL
            result = subprocess.run(
                ["git", "remote", "get-url", "origin"],
                cwd=project_dir,
                capture_output=True,
                encoding="utf-8",
                errors="replace",
            )

            if result.returncode == 0:
                return {"remote_name": "origin", "remote_url": result.stdout.strip()}
            else:
                return {"remote_name": "origin", "remote_url": ""}

        except subprocess.CalledProcessError:
            return {"remote_name": "origin", "remote_url": ""}

    @staticmethod
    def set_remote_config(project_id: int, remote_url: str, remote_name: str = "origin") -> bool:
        """
        Set or update remote repository configuration

        Args:
            project_id: The project ID
            remote_url: The remote repository URL
            remote_name: The remote name (default: origin)

        Returns:
            True if successful, False otherwise
        """
        from app.services.filesystem_service import FileSystemService

        project_dir = FileSystemService.get_project_dir(project_id)

        if not project_dir.exists() or not (project_dir / ".git").exists():
            return False

        try:
            # Check if remote exists
            result = subprocess.run(["git", "remote", "get-url", remote_name], cwd=project_dir, capture_output=True)

            if result.returncode == 0:
                # Remote exists, update it
                subprocess.run(
                    ["git", "remote", "set-url", remote_name, remote_url],
                    cwd=project_dir,
                    check=True,
                    capture_output=True,
                )
            else:
                # Remote doesn't exist, add it
                subprocess.run(
                    ["git", "remote", "add", remote_name, remote_url], cwd=project_dir, check=True, capture_output=True
                )

            return True

        except subprocess.CalledProcessError as e:
            print(f"Git remote config failed: {e}")
            return False

    @staticmethod
    def sync_with_remote(project_id: int, commit_message: str = "Auto-sync with remote") -> Dict[str, any]:
        """
        Sync with remote repository: fetch, pull, add, commit, push

        Args:
            project_id: The project ID
            commit_message: Commit message for local changes

        Returns:
            Dictionary with success status and messages
        """
        from app.services.filesystem_service import FileSystemService

        project_dir = FileSystemService.get_project_dir(project_id)

        if not project_dir.exists() or not (project_dir / ".git").exists():
            return {"success": False, "message": "Git repository not initialized"}

        result = {
            "success": True,
            "fetch": "",
            "pull": "",
            "commit": "",
            "push": "",
            "message": "Sync completed successfully",
        }

        try:
            # 1. Fetch from remote
            try:
                fetch_result = subprocess.run(
                    ["git", "fetch", "origin"],
                    cwd=project_dir,
                    capture_output=True,
                    encoding="utf-8",
                    errors="replace",
                    timeout=30,
                )
                result["fetch"] = "✓ Fetched from remote"
            except subprocess.TimeoutExpired:
                result["fetch"] = "⚠ Fetch timeout (no remote configured?)"
            except subprocess.CalledProcessError as e:
                result["fetch"] = f"⚠ Fetch failed: {e.stderr}"

            # 2. Pull from remote (with merge)
            try:
                pull_result = subprocess.run(
                    ["git", "pull", "origin", GitService.get_current_branch(project_id), "--no-rebase"],
                    cwd=project_dir,
                    capture_output=True,
                    encoding="utf-8",
                    errors="replace",
                    timeout=30,
                )
                if "Already up to date" in pull_result.stdout:
                    result["pull"] = "✓ Already up to date"
                else:
                    result["pull"] = "✓ Pulled changes from remote"
            except subprocess.TimeoutExpired:
                result["pull"] = "⚠ Pull timeout"
            except subprocess.CalledProcessError as e:
                result["pull"] = f"⚠ Pull failed: {e.stderr}"

            # 3. Add and commit local changes
            subprocess.run(["git", "add", "."], cwd=project_dir, check=True, capture_output=True)

            # Check if there are changes to commit
            diff_result = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=project_dir, capture_output=True)

            if diff_result.returncode == 1:
                # There are changes to commit
                subprocess.run(
                    ["git", "commit", "-m", commit_message], cwd=project_dir, check=True, capture_output=True
                )
                result["commit"] = "✓ Committed local changes"
            else:
                result["commit"] = "✓ No local changes to commit"

            # 4. Push to remote
            try:
                push_result = subprocess.run(
                    ["git", "push", "origin", GitService.get_current_branch(project_id)],
                    cwd=project_dir,
                    capture_output=True,
                    encoding="utf-8",
                    errors="replace",
                    timeout=30,
                )
                result["push"] = "✓ Pushed to remote"
            except subprocess.TimeoutExpired:
                result["push"] = "⚠ Push timeout"
                result["success"] = False
                result["message"] = "Sync incomplete: Push timeout"
            except subprocess.CalledProcessError as e:
                result["push"] = f"⚠ Push failed: {e.stderr}"
                result["success"] = False
                result["message"] = "Sync incomplete: Push failed"

            return result

        except subprocess.CalledProcessError as e:
            print(f"Git sync failed: {e}")
            return {
                "success": False,
                "message": f"Sync failed: {e!s}",
                "fetch": result.get("fetch", ""),
                "pull": result.get("pull", ""),
                "commit": result.get("commit", ""),
                "push": result.get("push", ""),
            }

    @staticmethod
    def clone_repository(
        repo_url: str,
        target_dir: str,
        branch: Optional[str] = None,
        github_token: Optional[str] = None
    ) -> Dict:
        """
        Clone a Git repository to the target directory.

        Args:
            repo_url: The repository URL (e.g., https://github.com/user/repo)
            target_dir: The directory to clone into
            branch: Optional branch name to checkout
            github_token: Optional GitHub personal access token for private repos

        Returns:
            Dict with success status and message
        """
        import re
        from pathlib import Path

        try:
            # Parse and validate GitHub URL
            github_pattern = r'^https?://github\.com/([^/]+)/([^/]+?)(?:\.git)?/?$'
            match = re.match(github_pattern, repo_url)

            if not match:
                return {
                    "success": False,
                    "message": "Invalid GitHub URL. Format: https://github.com/username/repository"
                }

            owner, repo_name = match.groups()
            repo_name = repo_name.replace('.git', '')

            # Build clone URL with token if provided (for private repos)
            if github_token:
                clone_url = f"https://{github_token}@github.com/{owner}/{repo_name}.git"
            else:
                clone_url = f"https://github.com/{owner}/{repo_name}.git"

            # Prepare clone command
            clone_cmd = ["git", "clone", "--depth", "1"]  # Shallow clone for speed

            if branch:
                clone_cmd.extend(["--branch", branch])

            clone_cmd.extend([clone_url, target_dir])

            # Execute clone
            result = subprocess.run(
                clone_cmd,
                capture_output=True,
                text=True,
                timeout=120  # 2 minute timeout
            )

            if result.returncode != 0:
                error_msg = result.stderr or result.stdout
                # Remove token from error message if present
                if github_token:
                    error_msg = error_msg.replace(github_token, "***TOKEN***")

                # Check for common errors
                if "Repository not found" in error_msg:
                    return {
                        "success": False,
                        "message": "Repository not found. Check the URL or use a token for private repos."
                    }
                elif "Authentication failed" in error_msg or "could not read Username" in error_msg:
                    return {
                        "success": False,
                        "message": "Authentication failed. Check your GitHub token."
                    }
                elif "already exists" in error_msg:
                    return {
                        "success": False,
                        "message": "Target directory already exists."
                    }

                return {
                    "success": False,
                    "message": f"Clone failed: {error_msg}"
                }

            # Configure git user for future commits
            target_path = Path(target_dir)
            subprocess.run(
                ["git", "config", "user.name", "ArtReal AI"],
                cwd=target_path,
                capture_output=True
            )
            subprocess.run(
                ["git", "config", "user.email", "ai@artreal.app"],
                cwd=target_path,
                capture_output=True
            )

            # Get list of files cloned
            files_cloned = []
            for root, dirs, files in os.walk(target_dir):
                # Skip .git directory
                dirs[:] = [d for d in dirs if d != '.git']
                for file in files:
                    rel_path = os.path.relpath(os.path.join(root, file), target_dir)
                    files_cloned.append(rel_path)

            return {
                "success": True,
                "message": f"Successfully cloned {owner}/{repo_name}",
                "owner": owner,
                "repo_name": repo_name,
                "branch": branch or "default",
                "files_count": len(files_cloned),
                "files": files_cloned[:50]  # Return first 50 files for preview
            }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "message": "Clone operation timed out. The repository might be too large."
            }
        except Exception as e:
            error_msg = str(e)
            if github_token:
                error_msg = error_msg.replace(github_token, "***TOKEN***")
            return {
                "success": False,
                "message": f"Clone failed: {error_msg}"
            }
