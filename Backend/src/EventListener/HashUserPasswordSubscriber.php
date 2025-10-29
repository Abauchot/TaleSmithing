<?php

namespace App\EventListener;

use App\Entity\User;
use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\Event\LifecycleEventArgs;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Doctrine subscriber that hashes User passwords on persist/update.
 */
class HashUserPasswordSubscriber implements EventSubscriber
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function getSubscribedEvents(): array
    {
        return ['prePersist', 'preUpdate'];
    }

    public function prePersist(LifecycleEventArgs $args): void
    {
        $this->hashPassword($args);
    }

    public function preUpdate(LifecycleEventArgs $args): void
    {
        $this->hashPassword($args);

        // When updating the entity we must recompute the change set so Doctrine persists the hashed password
        $entity = $args->getEntity();
        $em = $args->getEntityManager();
        $meta = $em->getClassMetadata(get_class($entity));
        $em->getUnitOfWork()->recomputeSingleEntityChangeSet($meta, $entity);
    }

    private function hashPassword(LifecycleEventArgs $args): void
    {
    $entity = $args->getEntity();

        if (!$entity instanceof User) {
            return;
        }

        $plain = $entity->getPassword();
        if (null === $plain || $plain === '') {
            return;
        }

        // Basic heuristic: if password looks already hashed (starts with $), skip hashing.
        if (str_starts_with($plain, '$')) {
            return;
        }

        $hashed = $this->passwordHasher->hashPassword($entity, $plain);
        $entity->setPassword($hashed);
    }
}
