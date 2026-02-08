import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MoreVertical, Trash2, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { projectApi } from '@/services/api';

interface ProjectCardProps {
  project: {
    id: number;
    name: string;
    description?: string;
    status?: string;
    created_at: string;
    thumbnail?: string;
  };
  index: number;
  onDelete: (id: number, name: string, e: React.MouseEvent) => void;
}

export const ProjectCard = ({ project, index, onDelete }: ProjectCardProps) => {
  const [thumbnail, setThumbnail] = useState<string | null>(project.thumbnail || null);
  const [isLoading, setIsLoading] = useState(!project.thumbnail);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && !thumbnail && isLoading) {
      const loadThumbnail = async () => {
        try {
          const data = await projectApi.getThumbnail(project.id);
          if (data.thumbnail) {
            setThumbnail(data.thumbnail);
          }
        } catch (error) {
          console.error('Failed to load thumbnail:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadThumbnail();
    }
  }, [isVisible, thumbnail, isLoading, project.id]);

  return (
    <div
      ref={cardRef}
      className="group relative h-full animate-ios-slide-up"
      style={{
        animationDelay: `${index * 50}ms`
      }}
    >
      <Link to={`/editor/${project.id}`} className="block h-full">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300">
          {/* Thumbnail */}
          <div className="relative h-44 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : thumbnail ? (
              <img
                src={thumbnail}
                alt={project.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-blue-400/5">
                <Sparkles className="w-10 h-10 text-primary/20" />
              </div>
            )}

            {/* Status Badge */}
            {project.status && (
              <div className="absolute top-3 left-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-foreground capitalize font-medium shadow-sm">
                  {project.status}
                </span>
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="p-5">
            <h3 className="text-base font-semibold mb-1.5 text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {project.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
              {project.description || 'No description available'}
            </p>
            <div className="flex items-center text-xs text-muted-foreground/80">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              {new Date(project.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </Link>

      {/* Actions Menu */}
      <div className="absolute top-48 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="p-2 bg-white hover:bg-gray-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-gray-200">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl shadow-lg">
            <DropdownMenuItem
              onClick={(e) => onDelete(project.id, project.name, e)}
              className="text-destructive focus:text-destructive rounded-lg"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
